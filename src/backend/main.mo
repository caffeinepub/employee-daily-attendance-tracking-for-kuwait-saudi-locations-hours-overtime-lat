import Array "mo:core/Array";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Migration "migration";
import BlobStorage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type EmployeeID = Text;
  type Project = { name : Text };
  public type Location = { #kuwait; #saudi };
  public type EmployeeType = { #company; #supplier };

  public type WorkingStatus = {
    #fullwork;
    #fullworkOvertime;
    #partialWork;
    #vacation;
    #holiday;
    #absent;
  };

  public type Designation = {
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

  public type Employee = {
    id : EmployeeID;
    name : Text;
    designation : Designation;
    employeeType : EmployeeType;
    location : Location;
    project : ?Project;
    photo : BlobStorage.ExternalBlob;
  };

  module Employee {
    public func compare(employee1 : Employee, employee2 : Employee) : Order.Order {
      Text.compare(employee1.id, employee2.id);
    };
  };

  public type AttendanceRecord = {
    employeeId : EmployeeID;
    date : Time.Time;
    checkIn : Time.Time;
    checkOut : ?Time.Time;
    totalHours : ?Nat;
    overtime : ?Nat;
    isLate : Bool;
    permission : ?Text;
    workingStatus : WorkingStatus;
  };

  module AttendanceRecord {
    public func compare(record1 : AttendanceRecord, record2 : AttendanceRecord) : Order.Order {
      Int.compare(record1.date, record2.date);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  type MonthlySummary = {
    workingDays : Nat;
    expectedWorkingDays : Nat;
    expectedHours : Nat;
    absentDays : Nat;
    netWorkingHours : Nat;
    normalHours : Nat;
    overtimeHours : Nat;
  };

  module MonthlySummary {
    public func empty(expectedWorkingDays : Nat) : MonthlySummary {
      let expectedHours = expectedWorkingDays * 8;
      {
        workingDays = 0;
        expectedWorkingDays;
        expectedHours;
        absentDays = 0;
        netWorkingHours = 0;
        normalHours = 0;
        overtimeHours = 0;
      };
    };

    public func merge(summaries : [MonthlySummary]) : MonthlySummary {
      let expectedWorkingDays = summaries.foldLeft(
        0,
        func(total, s) { total + s.expectedWorkingDays },
      );

      let expectedHours = summaries.foldLeft(
        0,
        func(total, s) { total + s.expectedHours },
      );

      summaries.foldLeft(
        {
          expectedWorkingDays;
          expectedHours;

          workingDays = 0;
          absentDays = 0;
          netWorkingHours = 0;
          normalHours = 0;
          overtimeHours = 0;
        },
        func(total, summary) {
          { total with
            workingDays = total.workingDays + summary.workingDays;
            absentDays = total.absentDays + summary.absentDays;
            netWorkingHours = total.netWorkingHours + summary.netWorkingHours;
            normalHours = total.normalHours + summary.normalHours;
            overtimeHours = total.overtimeHours + summary.overtimeHours;
          };
        },
      );
    };
  };

  let employees = Map.empty<EmployeeID, Employee>();
  let attendance = Map.empty<Time.Time, List.List<AttendanceRecord>>();
  var overtimeThreshold : Nat = 8;
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Employee Management API
  public shared ({ caller }) func addEmployee(
    id : EmployeeID,
    name : Text,
    designation : Designation,
    location : Location,
    employeeType : EmployeeType,
    project : ?Project,
    photo : BlobStorage.ExternalBlob,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add employees");
    };
    let employee : Employee = {
      id;
      name;
      designation;
      employeeType;
      location;
      project;
      photo;
    };
    employees.add(id, employee);
  };

  public query ({ caller }) func getEmployee(id : EmployeeID) : async Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view employees");
    };
    switch (employees.get(id)) {
      case (null) { Runtime.trap("Employee not found") };
      case (?employee) { employee };
    };
  };

  public query ({ caller }) func getEmployees() : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view employees");
    };
    employees.values().toArray().sort();
  };

  // Attendance Management API
  public shared ({ caller }) func recordCheckIn(employeeId : EmployeeID, checkIn : Time.Time, workingStatus : WorkingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record attendance");
    };

    let today = Time.now() / (24 * 60 * 60 * 1000000000); // Day-based grouping
    let record : AttendanceRecord = {
      employeeId;
      date = today;
      checkIn;
      checkOut = null;
      totalHours = null;
      overtime = null;
      isLate = false;
      permission = null;
      workingStatus;
    };

    let dayRecords = switch (attendance.get(today)) {
      case (null) { List.empty<AttendanceRecord>() };
      case (?existing) { existing };
    };
    dayRecords.add(record);
    attendance.add(today, dayRecords);
  };

  public shared ({ caller }) func recordCheckOut(employeeId : EmployeeID, checkOut : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record check-out");
    };

    let today = Time.now() / (24 * 60 * 60 * 1000000000);
    let dayRecords = switch (attendance.get(today)) {
      case (null) { Runtime.trap("No attendance records for today") };
      case (?records) { records };
    };

    let existingRecords = dayRecords.toArray();
    let recordIndex = existingRecords.findIndex(func(r) { r.employeeId == employeeId });

    switch (recordIndex) {
      case (null) { Runtime.trap("Check-in record not found") };
      case (?index) {
        let record = existingRecords[index];
        let totalHours = (checkOut - record.checkIn) / (60 * 60 * 1000000000 : Int);
        var overtime : ?Nat = null;
        if (totalHours > overtimeThreshold) {
          overtime := ?(totalHours - overtimeThreshold).toNat();
        };

        let updatedRecord : AttendanceRecord = {
          employeeId = record.employeeId;
          date = record.date;
          checkIn = record.checkIn;
          checkOut = ?checkOut;
          totalHours = ?(totalHours.toNat());
          overtime;
          isLate = record.isLate;
          permission = record.permission;
          workingStatus = record.workingStatus;
        };

        let updatedRecords = List.fromArray<AttendanceRecord>(existingRecords);
        updatedRecords.put(index, updatedRecord);
        attendance.add(today, updatedRecords);
      };
    };
  };

  public shared ({ caller }) func setEmployeeWorkingStatus(employeeId : EmployeeID, workingStatus : WorkingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update working status");
    };

    let today = Time.now() / (24 * 60 * 60 * 1000000000); // Current day (based on timestamp)

    // Get or create today's records
    var dayRecords = switch (attendance.get(today)) {
      case (null) { List.empty<AttendanceRecord>() };
      case (?existing) { existing };
    };

    // Find existing record for employee, or create new record if not found
    var recordIndex = 0;
    var found = false;
    for (record in dayRecords.values()) {
      if (record.employeeId == employeeId) {
        found := true;
        // Update existing record with new working status
        let updatedRecord = {
          employeeId;
          date = today;
          checkIn = record.checkIn;
          checkOut = record.checkOut;
          totalHours = record.totalHours;
          overtime = record.overtime;
          isLate = record.isLate;
          permission = record.permission;
          workingStatus;
        };
        dayRecords.put(recordIndex, updatedRecord);
      };
      recordIndex += 1;
    };

    // If no record found, create new one for working status
    if (not found) {
      let newRecord : AttendanceRecord = {
        employeeId;
        date = today;
        checkIn = Time.now();
        checkOut = null;
        totalHours = null;
        overtime = null;
        isLate = false;
        permission = null;
        workingStatus;
      };
      dayRecords.add(newRecord);
    };

    // Update attendance map with today's records
    attendance.add(today, dayRecords);
  };

  public query ({ caller }) func getEmployeeWorkingStatus(employeeId : EmployeeID) : async WorkingStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view working status");
    };

    let today = Time.now() / (24 * 60 * 60 * 1000000000);
    switch (attendance.get(today)) {
      case (null) {
        Runtime.trap("No attendance records found for today");
      };
      case (?dayRecords) {
        let arrayRecords = dayRecords.toArray();
        let maybeRecord = arrayRecords.find(func(record) { record.employeeId == employeeId });
        switch (maybeRecord) {
          case (null) {
            Runtime.trap("No record found for employee " # employeeId);
          };
          case (?record) { record.workingStatus };
        };
      };
    };
  };

  public query ({ caller }) func getOvertimeThreshold() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view overtime threshold");
    };
    overtimeThreshold;
  };

  public shared ({ caller }) func setOvertimeThreshold(threshold : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change overtime threshold");
    };
    overtimeThreshold := threshold;
  };
};
