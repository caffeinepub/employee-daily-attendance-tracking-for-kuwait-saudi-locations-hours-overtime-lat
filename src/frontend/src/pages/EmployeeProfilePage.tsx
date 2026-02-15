import React from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetEmployee } from '../hooks/useQueries';
import { ArrowLeft, MapPin, Briefcase, User } from 'lucide-react';
import EmployeePhotoThumbnail from '../components/employees/EmployeePhotoThumbnail';
import { EmployeeType } from '../backend';
import { getDesignationLabel } from '../utils/designation';

export default function EmployeeProfilePage() {
  const { employeeId } = useParams({ from: '/employees/$employeeId' });
  const { data: employee, isLoading, error } = useGetEmployee(employeeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <Link to="/employees">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Employee not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const empType = employee.employeeType || ('company' as EmployeeType);

  return (
    <div className="space-y-6">
      <Link to="/employees">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <EmployeePhotoThumbnail photo={employee.photo} name={employee.name} size="lg" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
                <p className="font-medium">{employee.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                <p className="font-medium">{employee.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Designation</p>
                <p className="font-medium">{getDesignationLabel(employee.designation)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Employee Type</p>
                <Badge variant={empType === 'company' ? 'default' : 'secondary'}>
                  <User className="mr-1 h-3 w-3" />
                  {empType === 'company' ? 'Company' : 'Supplier'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {employee.location === 'kuwait' ? 'Kuwait' : 'Saudi Arabia'}
                  </span>
                </div>
              </div>
              {employee.project && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project</p>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{employee.project.name}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Attendance history will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
