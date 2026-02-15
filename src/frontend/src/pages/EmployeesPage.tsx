import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGetEmployees, useIsCallerAdmin } from '../hooks/useQueries';
import { UserPlus, Search, Users } from 'lucide-react';
import EmployeeFormDialog from '../components/employees/EmployeeFormDialog';
import EmployeePhotoThumbnail from '../components/employees/EmployeePhotoThumbnail';
import { Link } from '@tanstack/react-router';
import { Location, EmployeeType } from '../backend';
import { getDesignationLabel } from '../utils/designation';

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | Location>('all');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<'all' | EmployeeType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: employees = [], isLoading } = useGetEmployees();
  const { data: isAdmin } = useIsCallerAdmin();

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = locationFilter === 'all' || emp.location === locationFilter;
      const empType = emp.employeeType || ('company' as EmployeeType);
      const matchesType = employeeTypeFilter === 'all' || empType === employeeTypeFilter;
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [employees, searchQuery, locationFilter, employeeTypeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage employee information and records</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={locationFilter} onValueChange={(value) => setLocationFilter(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="kuwait">Kuwait</SelectItem>
                <SelectItem value="saudi">Saudi Arabia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={employeeTypeFilter} onValueChange={(value) => setEmployeeTypeFilter(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredEmployees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {employees.length === 0 ? 'No employees added yet' : 'No employees match your search criteria'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => {
            const empType = employee.employeeType || ('company' as EmployeeType);
            return (
              <Link key={employee.id} to="/employees/$employeeId" params={{ employeeId: employee.id }}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <EmployeePhotoThumbnail photo={employee.photo} name={employee.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.id}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Designation:</span> {getDesignationLabel(employee.designation)}
                          </p>
                          <Badge variant={empType === 'company' ? 'default' : 'secondary'} className="text-xs">
                            {empType === 'company' ? 'Company' : 'Supplier'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {employee.location === 'kuwait' ? 'Kuwait' : 'Saudi Arabia'}
                          {employee.project && ` • ${employee.project.name}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <EmployeeFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
