import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export type EmployeeID = string;
export interface Employee {
    id: EmployeeID;
    employeeType: EmployeeType;
    name: string;
    designation: Designation;
    photo: ExternalBlob;
    location: Location;
    project?: Project;
}
export interface Project {
    name: string;
}
export interface UserProfile {
    name: string;
}
export enum Designation {
    accountant = "accountant",
    hvacTechnician = "hvacTechnician",
    logistics = "logistics",
    plumber = "plumber",
    laborer = "laborer",
    plumberHelper = "plumberHelper",
    estimatorInTendering = "estimatorInTendering",
    procurementProcurementSpecialist = "procurementProcurementSpecialist",
    fabricator = "fabricator",
    electricianSupervisor = "electricianSupervisor",
    other = "other",
    civilForeman = "civilForeman",
    kitchenHelper = "kitchenHelper",
    cook = "cook",
    siteTimekeeper = "siteTimekeeper",
    cashier = "cashier",
    seniorEngineerTendering = "seniorEngineerTendering",
    projectManagerKuwait = "projectManagerKuwait",
    generalClerk = "generalClerk",
    generalSupervisor = "generalSupervisor",
    painterSupervisor = "painterSupervisor",
    electrician = "electrician",
    mechanicalSupervisor = "mechanicalSupervisor",
    mechanic = "mechanic",
    cleanerSupervisor = "cleanerSupervisor",
    projectTechnical_manager = "projectTechnical_manager",
    storekeeper = "storekeeper",
    electricalForeman = "electricalForeman",
    pmoOperations_director = "pmoOperations_director",
    generalHelper = "generalHelper",
    maleNurse = "maleNurse",
    siteExpeditor = "siteExpeditor",
    mechanicalForeman = "mechanicalForeman",
    attendant = "attendant",
    cleaner = "cleaner",
    hrLabourDiscipline = "hrLabourDiscipline",
    waiter = "waiter",
    lawnkeeper = "lawnkeeper",
    forkliftOperator = "forkliftOperator",
    painter = "painter",
    matron = "matron",
    adminGeneral = "adminGeneral",
    pmoGeneral_manager = "pmoGeneral_manager",
    projectManagerSuperIntendent = "projectManagerSuperIntendent",
    civilSupervisor = "civilSupervisor",
    siteTimekeeperClerk = "siteTimekeeperClerk",
    therapist = "therapist"
}
export enum EmployeeType {
    supplier = "supplier",
    company = "company"
}
export enum Location {
    kuwait = "kuwait",
    saudi = "saudi"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WorkingStatus {
    partialWork = "partialWork",
    fullworkOvertime = "fullworkOvertime",
    fullwork = "fullwork",
    absent = "absent",
    holiday = "holiday",
    vacation = "vacation"
}
export interface backendInterface {
    addEmployee(id: EmployeeID, name: string, designation: Designation, location: Location, employeeType: EmployeeType, project: Project | null, photo: ExternalBlob): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEmployee(id: EmployeeID): Promise<Employee>;
    getEmployeeWorkingStatus(employeeId: EmployeeID): Promise<WorkingStatus>;
    getEmployees(): Promise<Array<Employee>>;
    getOvertimeThreshold(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordCheckIn(employeeId: EmployeeID, checkIn: Time, workingStatus: WorkingStatus): Promise<void>;
    recordCheckOut(employeeId: EmployeeID, checkOut: Time): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setEmployeeWorkingStatus(employeeId: EmployeeID, workingStatus: WorkingStatus): Promise<void>;
    setOvertimeThreshold(threshold: bigint): Promise<void>;
}
