import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetOvertimeThreshold, useSetOvertimeThreshold, useIsCallerAdmin } from '../../hooks/useQueries';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function OvertimeThresholdCard() {
  const { data: threshold, isLoading } = useGetOvertimeThreshold();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const setThreshold = useSetOvertimeThreshold();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    setEditValue(threshold ? threshold.toString() : '8');
    setIsEditing(true);
  };

  const handleSave = async () => {
    const value = parseInt(editValue, 10);
    if (isNaN(value) || value < 0 || value > 24) {
      toast.error('Please enter a valid number between 0 and 24');
      return;
    }

    try {
      await setThreshold.mutateAsync(BigInt(value));
      toast.success('Overtime threshold updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update overtime threshold');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  if (isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Overtime Threshold
        </CardTitle>
        <CardDescription>
          Employees working more than this number of hours per day are considered to be working overtime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{threshold ? threshold.toString() : '8'} hours</p>
              <p className="text-sm text-muted-foreground mt-1">Standard working hours per day</p>
            </div>
            {isAdmin && (
              <Button onClick={handleEdit} variant="outline">
                Edit
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Hours per day</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                max="24"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter hours"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={setThreshold.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {setThreshold.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={setThreshold.isPending}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
