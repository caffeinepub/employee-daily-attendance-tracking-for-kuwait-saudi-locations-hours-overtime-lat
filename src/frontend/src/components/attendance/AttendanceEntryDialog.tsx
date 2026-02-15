import React, { useState, useEffect } from 'react';
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
import { useRecordCheckIn, useRecordCheckOut, useSetEmployeeWorkingStatus } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { WorkingStatus, Employee } from '../../backend';
import { Clock, Calendar } from 'lucide-react';
import { formatDashboardDate } from '../../utils/formatDate';

interface AttendanceEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  selectedDate: string;
}

const workingStatusLabels: Record<WorkingStatus, string> = {
  fullwork: 'Full Work',
  fullworkOvertime: 'Full Work + Overtime',
  partialWork: 'Partial Work',
  vacation: 'Vacation',
  holiday: 'Holiday',
  absent: 'Absent',
};

export default function AttendanceEntryDialog({
  open,
  onOpenChange,
  employee,
  selectedDate,
}: AttendanceEntryDialogProps) {
  const [workingStatus, setWorkingStatus] = useState<WorkingStatus>('fullwork' as WorkingStatus);
  const [checkInTime, setCheckInTime] = useState('08:00');
  const [checkOutTime, setCheckOutTime] = useState('17:00');
  const [includeCheckTimes, setIncludeCheckTimes] = useState(true);

  const recordCheckIn = useRecordCheckIn();
  const recordCheckOut = useRecordCheckOut();
  const setStatus = useSetEmployeeWorkingStatus();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setWorkingStatus('fullwork' as WorkingStatus);
      setCheckInTime('08:00');
      setCheckOutTime('17:00');
      setIncludeCheckTimes(true);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (
        includeCheckTimes &&
        (workingStatus === 'fullwork' || workingStatus === 'fullworkOvertime' || workingStatus === 'partialWork')
      ) {
        // Parse times and create timestamps for the selected date
        const [year, month, day] = selectedDate.split('-').map(Number);
        const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
        const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);

        const checkInDate = new Date(year, month - 1, day, checkInHour, checkInMinute);
        const checkOutDate = new Date(year, month - 1, day, checkOutHour, checkOutMinute);

        // Validate times
        if (checkOutDate <= checkInDate) {
          toast.error('Check-out time must be after check-in time');
          return;
        }

        // Convert to nanoseconds (Time type in backend)
        const checkInNanos = BigInt(checkInDate.getTime()) * BigInt(1000000);
        const checkOutNanos = BigInt(checkOutDate.getTime()) * BigInt(1000000);

        // Record check-in
        await recordCheckIn.mutateAsync({
          employeeId: employee.id,
          checkIn: checkInNanos,
          workingStatus,
          isoDate: selectedDate,
        });

        // Record check-out
        await recordCheckOut.mutateAsync({
          employeeId: employee.id,
          checkOut: checkOutNanos,
          isoDate: selectedDate,
        });

        const hours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
        toast.success(`Attendance recorded: ${hours.toFixed(1)} hours`);
      } else {
        // Just set working status without times
        await setStatus.mutateAsync({
          employeeId: employee.id,
          workingStatus,
          isoDate: selectedDate,
        });
        toast.success(`Status set to ${workingStatusLabels[workingStatus]}`);
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to record attendance');
    }
  };

  const isWorking =
    workingStatus === 'fullwork' || workingStatus === 'fullworkOvertime' || workingStatus === 'partialWork';
  const isSubmitting = recordCheckIn.isPending || recordCheckOut.isPending || setStatus.isPending;

  // Calculate hours
  const calculateHours = () => {
    if (!includeCheckTimes || !isWorking) return null;
    try {
      const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
      const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
      const checkInMinutes = checkInHour * 60 + checkInMinute;
      const checkOutMinutes = checkOutHour * 60 + checkOutMinute;
      const totalMinutes = checkOutMinutes - checkInMinutes;
      if (totalMinutes <= 0) return null;
      return (totalMinutes / 60).toFixed(1);
    } catch {
      return null;
    }
  };

  const hours = calculateHours();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
          <DialogDescription>
            Enter attendance details for {employee.name} ({employee.id})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Date
            </Label>
            <div className="text-sm font-medium">{formatDashboardDate(selectedDate)}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingStatus">
              Working Status <span className="text-destructive">*</span>
            </Label>
            <Select value={workingStatus} onValueChange={(value) => setWorkingStatus(value as WorkingStatus)}>
              <SelectTrigger id="workingStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fullwork">Full Work</SelectItem>
                <SelectItem value="fullworkOvertime">Full Work + Overtime</SelectItem>
                <SelectItem value="partialWork">Partial Work</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isWorking && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeCheckTimes"
                  checked={includeCheckTimes}
                  onChange={(e) => setIncludeCheckTimes(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="includeCheckTimes" className="cursor-pointer">
                  Include check-in and check-out times
                </Label>
              </div>

              {includeCheckTimes && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkInTime" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Check-in Time
                      </Label>
                      <Input
                        id="checkInTime"
                        type="time"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkOutTime" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Check-out Time
                      </Label>
                      <Input
                        id="checkOutTime"
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                      />
                    </div>
                  </div>

                  {hours && (
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="text-lg font-semibold">{hours} hours</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Attendance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
