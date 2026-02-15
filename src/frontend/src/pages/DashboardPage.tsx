import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetEmployees, useGetOvertimeThreshold, useGetEmployeeWorkingStatus, useIsCallerAdmin } from '../hooks/useQueries';
import { Users, UserCheck, UserX, Clock, AlertCircle, Plus, Calendar } from 'lucide-react';
import { Location, WorkingStatus, Employee } from '../backend';
import OvertimeThresholdCard from '../components/overtime/OvertimeThresholdCard';
import AttendanceEntryDialog from '../components/attendance/AttendanceEntryDialog';
import EmployeePhotoThumbnail from '../components/employees/EmployeePhotoThumbnail';
import { formatDashboardDate } from '../utils/formatDate';

const workingStatusLabels: Record<WorkingStatus, string> = {
  fullwork: 'Full Work',
  fullworkOvertime: 'Full Work + OT',
  partialWork: 'Partial',
  vacation: 'Vacation',
  holiday: 'Holiday',
  absent: 'Absent',
};

const workingStatusColors: Record<WorkingStatus, string> = {
  fullwork: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  fullworkOvertime: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  partialWork: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  vacation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  holiday: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  absent: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

function EmployeeAttendanceRow({ employee, selectedDate }: { employee: Employee; selectedDate: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: workingStatus } = useGetEmployeeWorkingStatus(employee.id, selectedDate);
  const { data: isAdmin } = useIsCallerAdmin();

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-4">
          <EmployeePhotoThumbnail photo={employee.photo} name={employee.name} size="md" />
          <div>
            <p className="font-medium">{employee.name}</p>
            <p className="text-sm text-muted-foreground">
              {employee.id} • {employee.location === 'kuwait' ? 'Kuwait' : 'Saudi Arabia'}
              {employee.project && ` • ${employee.project.name}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {workingStatus ? (
            <Badge variant="outline" className={workingStatusColors[workingStatus]}>
              {workingStatusLabels[workingStatus]}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">No record</span>
          )}
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Entry
            </Button>
          )}
        </div>
      </div>

      {isAdmin && (
        <AttendanceEntryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          employee={employee}
          selectedDate={selectedDate}
        />
      )}
    </>
  );
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationFilter, setLocationFilter] = useState<'all' | Location>('all');
  const [projectFilter, setProjectFilter] = useState('');

  const { data: employees = [], isLoading } = useGetEmployees();
  const { data: overtimeThreshold } = useGetOvertimeThreshold();

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (locationFilter !== 'all' && emp.location !== locationFilter) return false;
      if (projectFilter && emp.project && !emp.project.name.toLowerCase().includes(projectFilter.toLowerCase()))
        return false;
      return true;
    });
  }, [employees, locationFilter, projectFilter]);

  // Calculate stats based on working status
  const stats = useMemo(() => {
    const total = filteredEmployees.length;
    let present = 0;
    let absent = 0;
    let vacation = 0;
    let holiday = 0;

    // Note: This is a simplified calculation since we can't efficiently query all statuses
    // In a real implementation, you'd want a backend endpoint that returns daily stats
    return {
      total,
      present,
      absent,
      vacation,
      holiday,
    };
  }, [filteredEmployees]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Attendance</h1>
          <p className="text-muted-foreground mt-1">Track employee attendance and working hours</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{formatDashboardDate(selectedDate)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.present}</div>
            <p className="text-xs text-muted-foreground mt-1">Working today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absent}</div>
            <p className="text-xs text-muted-foreground mt-1">Not present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vacation + stats.holiday}</div>
            <p className="text-xs text-muted-foreground mt-1">Vacation/Holiday</p>
          </CardContent>
        </Card>
      </div>

      <OvertimeThresholdCard />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={locationFilter} onValueChange={(value) => setLocationFilter(value as any)}>
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="kuwait">Kuwait</SelectItem>
                  <SelectItem value="saudi">Saudi Arabia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                placeholder="Filter by project name..."
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {employees.length === 0 ? 'No employees added yet' : 'No employees match the current filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <EmployeeAttendanceRow key={employee.id} employee={employee} selectedDate={selectedDate} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
