import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Employee, EmployeeID, Location, Project, UserProfile, UserRole, EmployeeType, WorkingStatus, Time, Designation } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
    onError: (error: any) => {
      console.error('Failed to save profile:', error);
      throw new Error(error.message || 'Failed to save profile');
    },
  });
}

// Authorization Queries
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Employee Queries
export function useGetEmployees() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmployees();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetEmployee(employeeId: EmployeeID) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Employee>({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEmployee(employeeId);
    },
    enabled: !!actor && !actorFetching && !!employeeId,
  });
}

export function useAddEmployee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      designation,
      location,
      employeeType,
      project,
      photo,
    }: {
      id: EmployeeID;
      name: string;
      designation: Designation;
      location: Location;
      employeeType: EmployeeType;
      project: Project | null;
      photo: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addEmployee(id, name, designation, location, employeeType, project, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to add employee';
      if (message.includes('Unauthorized')) {
        throw new Error('You do not have permission to add employees. Admin access required.');
      }
      throw new Error(message);
    },
  });
}

// Attendance Queries - Date-aware
export function useGetEmployeeWorkingStatus(employeeId: EmployeeID, isoDate: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WorkingStatus | null>({
    queryKey: ['workingStatus', employeeId, isoDate],
    queryFn: async () => {
      if (!actor) return null;
      try {
        // For now, backend only supports today's date
        // This will be updated when backend supports date parameter
        return await actor.getEmployeeWorkingStatus(employeeId);
      } catch (error: any) {
        // If no record found, return null instead of throwing
        if (error.message?.includes('No attendance records') || error.message?.includes('No record found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!employeeId,
  });
}

export function useRecordCheckIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      employeeId,
      checkIn,
      workingStatus,
      isoDate,
    }: {
      employeeId: EmployeeID;
      checkIn: Time;
      workingStatus: WorkingStatus;
      isoDate: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordCheckIn(employeeId, checkIn, workingStatus);
    },
    onSuccess: (_, variables) => {
      // Invalidate date-specific queries
      queryClient.invalidateQueries({ queryKey: ['workingStatus', variables.employeeId, variables.isoDate] });
      queryClient.invalidateQueries({ queryKey: ['workingStatus'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to record check-in';
      if (message.includes('Unauthorized')) {
        throw new Error('You do not have permission to record attendance. Admin access required.');
      }
      // Sanitize any technical errors
      if (message.includes('BigInt') || message.includes('Time')) {
        throw new Error('Invalid time format. Please check the time values and try again.');
      }
      throw new Error(message);
    },
  });
}

export function useRecordCheckOut() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      checkOut,
      isoDate,
    }: { 
      employeeId: EmployeeID; 
      checkOut: Time;
      isoDate: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordCheckOut(employeeId, checkOut);
    },
    onSuccess: (_, variables) => {
      // Invalidate date-specific queries
      queryClient.invalidateQueries({ queryKey: ['workingStatus', variables.employeeId, variables.isoDate] });
      queryClient.invalidateQueries({ queryKey: ['workingStatus'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to record check-out';
      if (message.includes('Unauthorized')) {
        throw new Error('You do not have permission to record attendance. Admin access required.');
      }
      // Sanitize any technical errors
      if (message.includes('BigInt') || message.includes('Time')) {
        throw new Error('Invalid time format. Please check the time values and try again.');
      }
      throw new Error(message);
    },
  });
}

export function useSetEmployeeWorkingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      employeeId, 
      workingStatus,
      isoDate,
    }: { 
      employeeId: EmployeeID; 
      workingStatus: WorkingStatus;
      isoDate: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setEmployeeWorkingStatus(employeeId, workingStatus);
    },
    onSuccess: (_, variables) => {
      // Invalidate date-specific queries
      queryClient.invalidateQueries({ queryKey: ['workingStatus', variables.employeeId, variables.isoDate] });
      queryClient.invalidateQueries({ queryKey: ['workingStatus'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update working status';
      if (message.includes('Unauthorized')) {
        throw new Error('You do not have permission to update attendance. Admin access required.');
      }
      throw new Error(message);
    },
  });
}

// Overtime Threshold Queries
export function useGetOvertimeThreshold() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['overtimeThreshold'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getOvertimeThreshold();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetOvertimeThreshold() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threshold: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setOvertimeThreshold(threshold);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overtimeThreshold'] });
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to update overtime threshold';
      if (message.includes('Unauthorized')) {
        throw new Error('You do not have permission to change the overtime threshold. Admin access required.');
      }
      throw new Error(message);
    },
  });
}

// Monthly Report Types (for when backend is implemented)
export interface MonthlyReportRow {
  employeeId: string;
  employeeName: string;
  employeeType: EmployeeType;
  location: Location;
  project: string | null;
  expectedWorkingDays: number;
  expectedHours: number;
  workingDays: number;
  absentDays: number;
  absentHours: number;
  totalWorkedHours: number;
  normalHours: number;
  overtimeHours: number;
}

export interface MonthlyReportFilters {
  year: number;
  month: number;
  location?: Location | 'all';
  project?: string | 'all';
  employeeType?: EmployeeType | 'all';
}

// Monthly Report Query (placeholder - backend not yet implemented)
export function useGetMonthlyReport(filters: MonthlyReportFilters) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MonthlyReportRow[]>({
    queryKey: ['monthlyReport', filters],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Replace with actual backend call when implemented
      // return actor.getMonthlyReport(filters.year, filters.month, filters.location, filters.project, filters.employeeType);
      
      // Placeholder: Return empty array until backend is ready
      console.warn('Monthly report backend API not yet implemented');
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

// CSV Export Mutations (placeholders - backend not yet implemented)
export function useExportAllData() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Replace with actual backend call when implemented
      // const csvData = await actor.exportAllData();
      // return csvData;
      
      throw new Error('Export all data API not yet implemented in backend');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to export data';
      if (message.includes('Unauthorized')) {
        throw new Error('You do not have permission to export data. Admin access required.');
      }
      throw new Error(message);
    },
  });
}

export function useExportMonthlyReport() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (filters: MonthlyReportFilters) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Replace with actual backend call when implemented
      // const csvData = await actor.exportMonthlyReport(filters.year, filters.month, filters.location, filters.project, filters.employeeType);
      // return csvData;
      
      throw new Error('Export monthly report API not yet implemented in backend');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to export monthly report';
      if (message.includes('Unauthorized')) {
        throw new Error('You do not have permission to export reports. Admin access required.');
      }
      throw new Error(message);
    },
  });
}
