import { Designation } from '../backend';

/**
 * Maps Designation enum values to human-readable English labels
 */
export function getDesignationLabel(designation: Designation): string {
  const labels: Record<Designation, string> = {
    [Designation.accountant]: 'Accountant',
    [Designation.adminGeneral]: 'Admin General',
    [Designation.attendant]: 'Attendant',
    [Designation.cashier]: 'Cashier',
    [Designation.civilForeman]: 'Civil Foreman',
    [Designation.civilSupervisor]: 'Civil Supervisor',
    [Designation.cleaner]: 'Cleaner',
    [Designation.cleanerSupervisor]: 'Cleaner Supervisor',
    [Designation.cook]: 'Cook',
    [Designation.electrician]: 'Electrician',
    [Designation.electricalForeman]: 'Electrical Foreman',
    [Designation.electricianSupervisor]: 'Electrician Supervisor',
    [Designation.estimatorInTendering]: 'Estimator in Tendering',
    [Designation.fabricator]: 'Fabricator',
    [Designation.forkliftOperator]: 'Forklift Operator',
    [Designation.generalClerk]: 'General Clerk',
    [Designation.generalHelper]: 'General Helper',
    [Designation.generalSupervisor]: 'General Supervisor',
    [Designation.hrLabourDiscipline]: 'HR Labour Discipline',
    [Designation.hvacTechnician]: 'HVAC Technician',
    [Designation.kitchenHelper]: 'Kitchen Helper',
    [Designation.laborer]: 'Laborer',
    [Designation.lawnkeeper]: 'Lawnkeeper',
    [Designation.logistics]: 'Logistics',
    [Designation.maleNurse]: 'Male Nurse',
    [Designation.matron]: 'Matron',
    [Designation.mechanic]: 'Mechanic',
    [Designation.mechanicalForeman]: 'Mechanical Foreman',
    [Designation.mechanicalSupervisor]: 'Mechanical Supervisor',
    [Designation.other]: 'Other',
    [Designation.painter]: 'Painter',
    [Designation.painterSupervisor]: 'Painter Supervisor',
    [Designation.plumber]: 'Plumber',
    [Designation.plumberHelper]: 'Plumber Helper',
    [Designation.pmoGeneral_manager]: 'PMO General Manager',
    [Designation.pmoOperations_director]: 'PMO Operations Director',
    [Designation.procurementProcurementSpecialist]: 'Procurement Specialist',
    [Designation.projectManagerKuwait]: 'Project Manager Kuwait',
    [Designation.projectManagerSuperIntendent]: 'Project Manager Superintendent',
    [Designation.projectTechnical_manager]: 'Project Technical Manager',
    [Designation.seniorEngineerTendering]: 'Senior Engineer Tendering',
    [Designation.siteExpeditor]: 'Site Expeditor',
    [Designation.siteTimekeeper]: 'Site Timekeeper',
    [Designation.siteTimekeeperClerk]: 'Site Timekeeper Clerk',
    [Designation.storekeeper]: 'Storekeeper',
    [Designation.therapist]: 'Therapist',
    [Designation.waiter]: 'Waiter',
  };

  return labels[designation] || 'Unknown';
}

/**
 * Returns all designation options sorted alphabetically by label
 */
export function getAllDesignationOptions(): Array<{ value: Designation; label: string }> {
  return Object.values(Designation).map((value) => ({
    value,
    label: getDesignationLabel(value),
  })).sort((a, b) => a.label.localeCompare(b.label));
}
