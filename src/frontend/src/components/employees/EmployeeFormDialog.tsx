import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddEmployee } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Location, EmployeeType, Designation } from '../../backend';
import EmployeePhotoUpload from './EmployeePhotoUpload';
import { ExternalBlob } from '../../backend';
import { getAllDesignationOptions, getDesignationLabel } from '../../utils/designation';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmployeeFormDialog({ open, onOpenChange }: EmployeeFormDialogProps) {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState<Designation | ''>('');
  const [location, setLocation] = useState<Location>('kuwait' as Location);
  const [employeeType, setEmployeeType] = useState<EmployeeType>('company' as EmployeeType);
  const [projectName, setProjectName] = useState('');
  const [photo, setPhoto] = useState<ExternalBlob | null>(null);

  const addEmployee = useAddEmployee();
  const designationOptions = getAllDesignationOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId.trim()) {
      toast.error('Employee ID is required');
      return;
    }
    if (!name.trim()) {
      toast.error('Employee name is required');
      return;
    }
    if (!designation) {
      toast.error('Designation is required');
      return;
    }
    if (!photo) {
      toast.error('Employee photo is required');
      return;
    }

    try {
      await addEmployee.mutateAsync({
        id: employeeId.trim(),
        name: name.trim(),
        designation: designation as Designation,
        location,
        employeeType,
        project: projectName.trim() ? { name: projectName.trim() } : null,
        photo,
      });
      toast.success('Employee added successfully');
      onOpenChange(false);
      // Reset form
      setEmployeeId('');
      setName('');
      setDesignation('');
      setLocation('kuwait' as Location);
      setEmployeeType('company' as EmployeeType);
      setProjectName('');
      setPhoto(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add employee');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Enter the employee details and upload their ID photo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">
              Employee ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="employeeId"
              placeholder="e.g., EMP001"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input id="name" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">
              Designation <span className="text-destructive">*</span>
            </Label>
            <Select value={designation} onValueChange={(value) => setDesignation(value as Designation)}>
              <SelectTrigger id="designation">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {designationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeType">
              Employee Type <span className="text-destructive">*</span>
            </Label>
            <Select value={employeeType} onValueChange={(value) => setEmployeeType(value as EmployeeType)}>
              <SelectTrigger id="employeeType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-destructive">*</span>
            </Label>
            <Select value={location} onValueChange={(value) => setLocation(value as Location)}>
              <SelectTrigger id="location">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kuwait">Kuwait</SelectItem>
                <SelectItem value="saudi">Saudi Arabia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project (Optional)</Label>
            <Input
              id="project"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              ID Photo <span className="text-destructive">*</span>
            </Label>
            <EmployeePhotoUpload onPhotoChange={setPhoto} />
            <p className="text-xs text-muted-foreground">
              Upload a clear photo of the employee's ID. Max size: 5MB. Accepted formats: JPG, PNG, WebP.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={addEmployee.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={addEmployee.isPending}>
              {addEmployee.isPending ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
