import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import BlobStorage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type EmployeeID = Text;
  type Project = { name : Text };
  type Location = { #kuwait; #saudi };
  type EmployeeType = { #company; #supplier };

  type WorkingStatus = {
    #fullwork;
    #fullworkOvertime;
    #partialWork;
    #vacation;
    #holiday;
    #absent;
  };

  // New designation type (now with variants)
  type Designation = {
    #accountant;
    #adminGeneral;
    #attendant;
    #cashier;
    #civilForeman;
    #civilSupervisor;
    #cleaner;
    #cleanerSupervisor;
    #cook;
    #electrician;
    #electricalForeman;
    #electricianSupervisor;
    #estimatorInTendering;
    #fabricator;
    #forkliftOperator;
    #generalClerk;
    #generalHelper;
    #generalSupervisor;
    #hrLabourDiscipline;
    #hvacTechnician;
    #kitchenHelper;
    #laborer;
    #lawnkeeper;
    #logistics;
    #maleNurse;
    #matron;
    #mechanic;
    #mechanicalForeman;
    #mechanicalSupervisor;
    #other;
    #painter;
    #painterSupervisor;
    #plumber;
    #plumberHelper;
    #pmoGeneral_manager;
    #pmoOperations_director;
    #procurementProcurementSpecialist;
    #projectManagerKuwait;
    #projectManagerSuperIntendent;
    #projectTechnical_manager;
    #seniorEngineerTendering;
    #siteExpeditor;
    #siteTimekeeper;
    #siteTimekeeperClerk;
    #storekeeper;
    #therapist;
    #waiter;
  };

  // Old type without designation
  type OldEmployee = {
    id : EmployeeID;
    name : Text;
    employeeType : EmployeeType;
    location : Location;
    project : ?Project;
    photo : BlobStorage.ExternalBlob;
  };

  // New type with explicit designation
  type NewEmployee = {
    id : EmployeeID;
    name : Text;
    designation : Designation;
    employeeType : EmployeeType;
    location : Location;
    project : ?Project;
    photo : BlobStorage.ExternalBlob;
  };

  type AttendanceRecord = {
    employeeId : EmployeeID;
    date : Int;
    checkIn : Int;
    checkOut : ?Int;
    totalHours : ?Nat;
    overtime : ?Nat;
    isLate : Bool;
    permission : ?Text;
    workingStatus : WorkingStatus;
  };

  type UserProfile = { name : Text };
  type OldActor = {
    employees : Map.Map<Text, OldEmployee>;
    attendance : Map.Map<Int, List.List<AttendanceRecord>>;
    overtimeThreshold : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };
  type NewActor = {
    employees : Map.Map<Text, NewEmployee>;
    attendance : Map.Map<Int, List.List<AttendanceRecord>>;
    overtimeThreshold : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let newEmployees = old.employees.map<Text, OldEmployee, NewEmployee>(
      func(_id, oldEmployee) {
        {
          oldEmployee with
          // Default to `other` for old employees (unknown designation)
          designation = #other;
        };
      }
    );
    { old with employees = newEmployees };
  };
};
