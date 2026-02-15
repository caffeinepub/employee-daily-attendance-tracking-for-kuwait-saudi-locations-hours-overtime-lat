import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetMonthlyReport, useExportMonthlyReport, useIsCallerAdmin } from '../hooks/useQueries';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Location, EmployeeType } from '../backend';
import type { MonthlyReportFilters } from '../hooks/useQueries';
import { downloadCsv } from '../utils/downloadCsv';

export default function MonthlyReportPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [locationFilter, setLocationFilter] = useState<'all' | Location>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<'all' | EmployeeType>('all');

  const { data: isAdmin = false } = useIsCallerAdmin();

  const filters: MonthlyReportFilters = {
    year: selectedYear,
    month: selectedMonth,
    location: locationFilter,
    project: projectFilter,
    employeeType: employeeTypeFilter,
  };

  const { data: reportData = [], isLoading } = useGetMonthlyReport(filters);
  const exportMutation = useExportMonthlyReport();

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const uniqueProjects = useMemo(() => {
    const projects = new Set<string>();
    reportData.forEach((row) => {
      if (row.project) projects.add(row.project);
    });
    return Array.from(projects).sort();
  }, [reportData]);

  const handleExport = async () => {
    if (!isAdmin) {
      toast.error('Only admins can export reports');
      return;
    }

    try {
      const csvData = await exportMutation.mutateAsync(filters);
      const monthName = months.find((m) => m.value === selectedMonth)?.label || selectedMonth;
      const filename = `monthly-report-${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${monthName}.csv`;
      downloadCsv(csvData, filename);
      toast.success('Report exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Monthly Report</h1>
          <p className="text-muted-foreground mt-1">View and export monthly attendance summaries</p>
        </div>
        {isAdmin && (
          <Button onClick={handleExport} disabled={exportMutation.isPending || reportData.length === 0}>
            {exportMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </>
            )}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Period & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {uniqueProjects.map((project) => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Monthly Summary{' '}
            <span className="text-muted-foreground font-normal">
              ({months.find((m) => m.value === selectedMonth)?.label} {selectedYear})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading report data...</p>
              </div>
            </div>
          ) : reportData.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No data available for the selected period</p>
              <p className="text-sm text-muted-foreground">
                Note: Backend API for monthly reports is not yet implemented
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Expected Days</TableHead>
                    <TableHead className="text-right">Expected Hrs</TableHead>
                    <TableHead className="text-right">Working Days</TableHead>
                    <TableHead className="text-right">Absent Days</TableHead>
                    <TableHead className="text-right">Absent Hrs</TableHead>
                    <TableHead className="text-right">Total Hrs</TableHead>
                    <TableHead className="text-right">Normal Hrs</TableHead>
                    <TableHead className="text-right">Overtime Hrs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row) => (
                    <TableRow key={row.employeeId}>
                      <TableCell className="font-medium">{row.employeeId}</TableCell>
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>
                        <Badge variant={row.employeeType === 'company' ? 'default' : 'secondary'} className="text-xs">
                          {row.employeeType === 'company' ? 'Company' : 'Supplier'}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.location === 'kuwait' ? 'Kuwait' : 'Saudi Arabia'}</TableCell>
                      <TableCell>{row.project || '-'}</TableCell>
                      <TableCell className="text-right">{row.expectedWorkingDays}</TableCell>
                      <TableCell className="text-right">{row.expectedHours}</TableCell>
                      <TableCell className="text-right">{row.workingDays}</TableCell>
                      <TableCell className="text-right">{row.absentDays}</TableCell>
                      <TableCell className="text-right">{row.absentHours}</TableCell>
                      <TableCell className="text-right font-medium">{row.totalWorkedHours}</TableCell>
                      <TableCell className="text-right">
                        {row.employeeType === 'company' ? row.normalHours : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.employeeType === 'company' ? row.overtimeHours : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
