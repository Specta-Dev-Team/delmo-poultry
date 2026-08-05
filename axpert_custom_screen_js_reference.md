# Axpert Custom Screen JS Functions — Complete Developer Reference

> **Source:** Compiled from [developer.agile-labs.com](https://developer.agile-labs.com) — official Axpert documentation  
> **Applies to:** Axpert 10.x / 11.x — HTML Plug-ins, Custom JS in TStructs, IView Custom UI  
> **Last compiled:** June 2026

---

## Table of Contents

1. [Where Custom JS Runs in Axpert](#1-where-custom-js-runs-in-axpert)
2. [Data Source API Functions](#2-data-source-api-functions)
   - [GetIViewData](#21-getiviewdata)
   - [GetIViewParams](#22-getiviewparams)
   - [GetWidgetData](#23-getwidgetdata)
3. [TStruct Save / POST API](#3-tstruct-save--post-api)
4. [Form Control Functions (Ax Functions)](#4-form-control-functions-ax-functions)
   - [AxHideControls / AxUnhideControl](#41-axhidecontrols--axunhidecontrol)
   - [AxDisableControls / AxEnableControls](#42-axdisablecontrols--axenablecontrols)
   - [AxAllowEmpty](#43-axallowempty)
   - [AxReadOnly](#44-axreadonly)
   - [AxDcCollapse / AxDcExpand](#45-axdccollapse--axdcexpand)
5. [Event Hooks in Forms](#5-event-hooks-in-forms)
   - [Form Control Enabled Events](#51-form-control-enabled-events)
   - [Form Control Disabled Events](#52-form-control-disabled-events)
   - [Workflow Events](#53-workflow-events)
6. [Custom Button Click in TStructs](#6-custom-button-click-in-tstructs)
7. [Calling External / Server-Side Services](#7-calling-external--server-side-services)
8. [UI Helper Functions](#8-ui-helper-functions)
9. [Field Access via jQuery in Custom JS](#9-field-access-via-jquery-in-custom-js)
10. [How to Set Up Custom JS Files](#10-how-to-set-up-custom-js-files)
11. [Response Handling Pattern](#11-response-handling-pattern)
12. [Complete Usage Examples](#12-complete-usage-examples)
13. [Quick Reference Cheat Sheet](#13-quick-reference-cheat-sheet)

---

## 1. Where Custom JS Runs in Axpert

Axpert supports custom JavaScript in three places:

| Context | How JS Is Loaded | Use Case |
|---|---|---|
| **HTML Plug-in** | Defined in HTML Pages option in Dev site; Add JS via "Add JS" button | Fully custom dashboards, standalone pages |
| **Custom JS in TStruct** | `<transid>.js` file placed in `webcode\<project>\tstruct\JS\` | Intercept form events, button logic |
| **Custom JS in IView** | Linked via `AddCustomLinkToIView()` in `custom.cs` | Popup forms from lists, custom row actions |

> All these contexts have access to the Axpert JS API functions described in this document.

---

## 2. Data Source API Functions

These functions fetch data from Axpert data sources (IViews / Widgets) directly into your custom HTML screens.

---

### 2.1 `GetIViewData`

Fetches data rows from a named **IView (data source / list / report)** created in Axpert.

```javascript
GetIViewData(iviewName, paramString, pageNumber, pageSize, function(data) {
    var rows = JSON.parse(data);
    // rows is an array of JSON objects
});
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `iviewName` | String | The name of the IView defined in Axpert |
| `paramString` | String | Param values as `"param1~value1,param2~value2"` — use `""` if no params |
| `pageNumber` | Number | Page number for pagination, starts at `1` |
| `pageSize` | Number | Number of records per page (e.g. `50`, `100`) |
| `callback` | Function | Receives the JSON string result |

**Example — load all employees in Sales dept, page 1:**

```javascript
GetIViewData("EmployeeList", "dept~Sales,status~Active", 1, 100, function(data) {
    var employees = JSON.parse(data);
    employees.forEach(function(emp) {
        console.log(emp.name, emp.empid);
    });
});
```

**Returned JSON structure (example):**

```json
[
  { "empid": "E001", "name": "John", "dept": "Sales", "salary": 50000 },
  { "empid": "E002", "name": "Jane", "dept": "Sales", "salary": 60000 }
]
```

> **Tip:** Always call `GetIViewParams` first if you are unsure what parameter names the IView expects.

---

### 2.2 `GetIViewParams`

Retrieves the **parameter definitions** for a given IView — tells you what params exist and their types before calling `GetIViewData`.

```javascript
GetIViewParams(iviewName, function(data) {
    var params = JSON.parse(data);
    console.log(params);
});
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `iviewName` | String | The name of the IView |
| `callback` | Function | Receives a JSON string of parameter info |

**Example:**

```javascript
GetIViewParams("SalesReport", function(data) {
    var paramDefs = JSON.parse(data);
    // Use paramDefs to know which params to pass to GetIViewData
    paramDefs.forEach(function(p) {
        console.log("Param name:", p.name, "| Type:", p.type);
    });
});
```

---

### 2.3 `GetWidgetData`

Fetches data for an **Axpert Card (Widget/Dashboard tile)** by its numeric widget ID.

```javascript
GetWidgetData(widgetId, function(data) {
    var result = JSON.parse(data);
    // use result to render your custom widget UI
});
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `widgetId` | Number | The numeric ID of the widget defined in Axpert Cards |
| `callback` | Function | Receives a JSON string |

**Example:**

```javascript
GetWidgetData(5, function(data) {
    var widgetData = JSON.parse(data);
    document.getElementById("total-sales").innerText = widgetData.totalSales;
});
```

---

## 3. TStruct Save / POST API

To **save / post data** into a TStruct from custom JS, use a jQuery `$.ajax` POST call.

```javascript
$.ajax({
    type: "POST",
    url: "/YourApp/AxpertService.aspx/SaveData",  // your Axpert endpoint
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify({
        transid: "rcatt",         // TStruct transid (name)
        fieldname1: "value1",     // replace with actual TStruct field names
        fieldname2: "value2",
        fieldname3: 100
    }),
    dataType: "json",
    success: function(response) {
        var resp = response.d;
        var result = resp.split('~');
        if (result[0] === "true" || result[0] === "T") {
            showAlertDialog("info", result[1]);   // success message
        } else {
            showAlertDialog("error", result[1]);  // error message
        }
    },
    failure: function(response) {
        showAlertDialog("error", response.d);
    }
});
```

> **Note:** Replace field names in the JSON body with the actual field names from your TStruct definition. The `transid` must match exactly.

**Getting the correct API URL and JSON format:**  
Go to **Utility → Get Axpert API** in the developer site. Select the category, form, and field name — the URL and sample JSON are auto-generated for you.

---

## 4. Form Control Functions (Ax Functions)

These are built-in Axpert script functions used inside form **Event scripts**. They control field visibility, state, and behavior.

> **Important:** These `Ax*` functions are **Axpert Script language** functions used in the Script editor (not plain JS). However, they are triggered from events that are set up in the developer site, and custom JS buttons can trigger scripts that call these.

---

### 4.1 `AxHideControls` / `AxUnhideControl`

Show or hide one or more fields on the form.

```
AxHideControls({fieldname1, fieldname2})   // Hide fields
AxUnhideControl({fieldname1, fieldname2})  // Show hidden fields
```

**Example — hide experience field when name is "Syamala":**

```
if name = {syamala}
  AxHideControls({exp})
else
  AxUnhideControl({exp})
end
```

---

### 4.2 `AxDisableControls` / `AxEnableControls`

Disable (make non-editable) or enable a field.

```
AxDisableControls({fieldname1, fieldname2})  // Disable fields
AxEnableControls({fieldname1, fieldname2})   // Enable fields
```

**Example — disable a DC when a condition is met:**

```
if age < eage
  AxHideControls({dc1})
elseif age > eage
  AxDisableControls({dc1})
end
```

---

### 4.3 `AxAllowEmpty`

Set whether a field is **mandatory** (`F`) or **optional** (`T`).

```
AxAllowEmpty({fieldname1, fieldname2}, T)   // Non-mandatory (allow empty)
AxAllowEmpty({fieldname3, fieldname4}, F)   // Mandatory (do not allow empty)
```

**Example:**

```
AxAllowEmpty({age}, T)          // age is optional
AxAllowEmpty({department}, F)   // department is mandatory
```

---

### 4.4 `AxReadOnly`

Makes the **entire form read-only** when loaded — all fields become non-editable.

```
AxReadOnly()
```

Typically used on the **On Data Load** event to prevent editing of existing records under certain conditions.

---

### 4.5 `AxDcCollapse` / `AxDcExpand`

Controls the **collapsed/expanded state** of a Boolean DC (collapsible section) on the form.

```
AxDcCollapse({dcname})   // Collapse the DC
AxDcExpand({dcname})     // Expand the DC
```

**Example:**

```
AxDcCollapse({additionalInfo})   // collapse the "additionalInfo" DC on load
```

---

## 5. Event Hooks in Forms

Events are configured in the Axpert Script editor by enabling **Form Control** and selecting the event type from a dropdown. These are the available hooks:

---

### 5.1 Form Control Enabled Events

These fire based on user interactions with fields in the form. Enable **Form Control** checkbox in the script first.

| Event | When It Fires | Typical Use |
|---|---|---|
| `On Data Load` | When existing record data is loaded into the form | Pre-fill logic, disable fields conditionally |
| `On Form Load` | When the form first opens (new or existing) | Hide sections, set defaults |
| `On Field Enter` | When user clicks into / tabs into a specific field | Conditional visibility based on other field values |
| `On Field Exit` | When user leaves a field | Validate, compute derived values |
| `On Click` | When user clicks on a specific field | Trigger custom logic on click |

**Example — On Form Load: hide dc1 fields:**

```
AxHideControls({dc1})
```

**Example — On Field Exit: validate age vs experience age:**

```
if age < eage
  AxHideControls({dc1})
elseif age > eage
  AxDisableControls({dc1})
end
```

---

### 5.2 Form Control Disabled Events

These fire based on transaction lifecycle actions. **Do NOT enable** Form Control for these.

| Event | When It Fires | Typical Use |
|---|---|---|
| `Before Save Transaction` | Before the record is saved to DB | Pre-save validation, insert to another table |
| `After Save Transaction` | After the record is saved to DB | Post-save notifications, secondary inserts |
| `Before Delete Transaction` | Before the record is deleted | Archive, pre-delete checks |
| `Before Cancel Transaction` | Before a cancel action | Log cancellation, revert related data |

**Example — After Save: insert a record into a log table:**

```
FireSQL("INSERT INTO stud (name) VALUES ('pqrs')")
```

---

### 5.3 Workflow Events

These fire during workflow approval processes. Requires workflow to be configured with User Roles.

| Event | When It Fires |
|---|---|
| `On Create` | When a new record is created and submitted |
| `On Approve` | When a manager/approver approves the record |

**Example — On Approve: insert approval record:**

```
FireSQL("INSERT INTO stud (name) VALUES ('{approver_name}')")
```

---

## 6. Custom Button Click in TStructs

When you add a **custom toolbar button** to a TStruct, Axpert automatically generates a button with a numeric ID. You handle the click in the custom JS file named `<transid>.js`.

**Button click handler pattern:**

```javascript
// Button with ID 13 in the TStruct
function btn13onclick() {
    // your logic here
    SendOTP();
}
```

> The function name format is always: `btn` + `{buttonId}` + `onclick`  
> The button ID is visible in the Toolbar configuration in the Axpert developer site.

**Multiple buttons example:**

```javascript
function btn1onclick() {
    validateAndSubmit();
}

function btn2onclick() {
    clearForm();
}

function btn13onclick() {
    SendOTP();
}
```

---

## 7. Calling External / Server-Side Services

From a custom JS file attached to a TStruct or IView, you can call external APIs or your own server-side `.aspx` web methods.

**Full pattern:**

```javascript
function SendOTP() {
    // 1. Read a field value from the TStruct form
    //    Field selector pattern: #<fieldname>000F1
    var aadharno = $("#employeename000F1").val();

    if (aadharno !== "") {
        $.ajax({
            type: "POST",
            url: "../mycustomcode.aspx/sendotp",   // your server-side method
            data: '{aadhar: "' + aadharno + '"}',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: OnSuccess,
            failure: function(response) {
                showAlertDialog("error", response.d);
            }
        });
    } else {
        showAlertDialog("error", "Aadhar number is mandatory.");
    }
}

function OnSuccess(response) {
    var resp = response.d;
    var result = resp.split('~');
    if (result[0]) {
        showAlertDialog("info", result[1]);
    } else {
        showAlertDialog("error", result[1]);
    }
}
```

> **Response format:** Axpert responses use a `~` delimiter. `result[0]` = success flag (`true`/`false`), `result[1]` = message.

---

## 8. UI Helper Functions

These are built-in Axpert JS helper functions available in all custom screens.

### `showAlertDialog`

Displays a dialog box to the user.

```javascript
showAlertDialog("info", "Your message here.");    // Info/success dialog
showAlertDialog("error", "Something went wrong."); // Error dialog
```

| Parameter | Values | Description |
|---|---|---|
| `type` | `"info"` / `"error"` | Type of dialog |
| `message` | String | The message to display |

---

## 9. Field Access via jQuery in Custom JS

Axpert renders TStruct fields as HTML inputs inside an iframe. You can access their values using jQuery with a specific selector pattern.

**Selector pattern:**

```
#<fieldname>000F1
```

Where `<fieldname>` is the exact internal field name (not caption) defined in the TStruct.

**Examples:**

```javascript
// Read a field value
var empName = $("#employeename000F1").val();
var age = parseInt($("#age000F1").val());

// Set a field value
$("#department000F1").val("Sales");

// Listen to field change (use sparingly inside Axpert)
$("#status000F1").on("change", function() {
    var selectedVal = $(this).val();
    console.log("Status changed to:", selectedVal);
});
```

> **Tip:** Open Chrome DevTools → Inspect on the TStruct form field to confirm the exact rendered HTML `id` attribute.

---

## 10. How to Set Up Custom JS Files

### For TStructs (Forms)

1. Create a JS file named `<transid>.js` (transid = the TStruct's internal name).
2. Place the file at:
   ```
   webcode\<projectname>\tstruct\JS\<transid>.js
   ```
3. In the Axpert Developer site → **Developer Options**, add a key:
   - Property Name: `Custom Java Script`
   - Property Value: `true`
   - Form Name: Select the TStruct caption
   - Role Name: `ALL` (or a specific role)

### For IViews (Lists/Reports)

1. Create a JS file (any name, e.g. `ThisFile.js`).
2. Place at:
   ```
   webcode\<projectname>\js\ThisFile.js
   ```
3. In `custom.cs`, register it:
   ```csharp
   AddCustomLinkToIView("ThisIView", "Js/ThisFile.js");
   ```

### For Custom CSS in TStructs

1. Create a CSS file named `<transid>.css`.
2. Place at:
   ```
   webcode\<projectname>\tstruct\css\<transid>.css
   ```
3. In Developer Options, add a key:
   - Property Name: `Custom CSS`
   - Property Value: `true`
   - Form Name: Select the TStruct caption
   - Role Name: `ALL`

### For HTML Plug-ins (Custom Pages)

1. In Axpert Developer site → **HTML Pages** → New.
2. Set caption and upload any images required.
3. Enter HTML code in the HTML editor.
4. Use **Add CSS** and **Add JS** buttons at bottom right to attach style and script files.
5. Axpert automatically references these CSS/JS files in the HTML.

---

## 11. Response Handling Pattern

All Axpert API responses follow the same pattern. Standardize your success handler like this:

```javascript
function handleAxpertResponse(response) {
    var resp = response.d;
    var result = resp.split('~');

    // result[0] = "true" or "false" (success flag)
    // result[1] = message or data
    if (result[0] === "true" || result[0] === "T") {
        showAlertDialog("info", result[1]);
        // optionally refresh IView or update UI
    } else {
        showAlertDialog("error", result[1]);
    }
}
```

---

## 12. Complete Usage Examples

### Example 1 — HTML Plug-in: Load IView data and build a custom table

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Custom Dashboard</title>
    <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #4a90d9; color: white; }
    </style>
</head>
<body>
    <h2>Employee List</h2>
    <div id="loadingMsg">Loading...</div>
    <table id="empTable">
        <thead>
            <tr><th>ID</th><th>Name</th><th>Department</th><th>Salary</th></tr>
        </thead>
        <tbody id="empBody"></tbody>
    </table>

    <script>
        // Called on page load — fetch IView data
        window.onload = function() {
            // Step 1: Check available params
            GetIViewParams("EmployeeList", function(paramData) {
                var params = JSON.parse(paramData);
                console.log("Params:", params);

                // Step 2: Fetch data using discovered params
                GetIViewData("EmployeeList", "status~Active", 1, 200, function(data) {
                    document.getElementById("loadingMsg").style.display = "none";
                    var employees = JSON.parse(data);
                    var tbody = document.getElementById("empBody");
                    tbody.innerHTML = "";

                    employees.forEach(function(emp) {
                        var row = "<tr>" +
                            "<td>" + emp.empid + "</td>" +
                            "<td>" + emp.name + "</td>" +
                            "<td>" + emp.dept + "</td>" +
                            "<td>" + emp.salary + "</td>" +
                        "</tr>";
                        tbody.innerHTML += row;
                    });
                });
            });
        };
    </script>
</body>
</html>
```

---

### Example 2 — TStruct Custom Button: Validate and call external API

**File:** `employeeform.js`

```javascript
// Button 1 click — validate and send OTP
function btn1onclick() {
    validateEmployeeAndSubmit();
}

// Button 2 click — clear and reset
function btn2onclick() {
    clearEmployeeForm();
}

function validateEmployeeAndSubmit() {
    var empName = $("#employeename000F1").val();
    var empAge  = parseInt($("#age000F1").val());
    var dept    = $("#department000F1").val();

    // Basic validation
    if (!empName) {
        showAlertDialog("error", "Employee name is required.");
        return;
    }
    if (isNaN(empAge) || empAge < 18) {
        showAlertDialog("error", "Age must be 18 or above.");
        return;
    }

    // Call external API
    $.ajax({
        type: "POST",
        url: "../MyCustomService.aspx/ValidateEmployee",
        data: JSON.stringify({ name: empName, age: empAge, dept: dept }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var result = response.d.split('~');
            if (result[0] === "true") {
                showAlertDialog("info", "Employee validated: " + result[1]);
            } else {
                showAlertDialog("error", result[1]);
            }
        },
        failure: function(err) {
            showAlertDialog("error", "Service call failed.");
        }
    });
}

function clearEmployeeForm() {
    $("#employeename000F1").val("");
    $("#age000F1").val("");
    $("#department000F1").val("");
}
```

---

### Example 3 — Popup a TStruct form from an IView row click

**File:** `ThisFile.js`  
**Registered via:** `AddCustomLinkToIView("EmployeeList", "Js/ThisFile.js");`

```javascript
function openEmployeeForm(recordId) {
    // Opens the TStruct form in a popup with the selected record
    var url = "../Forms/employeeform.aspx?id=" + recordId;
    window.open(url, "EmployeeForm", "width=800,height=600,scrollbars=yes");
}
```

---

### Example 4 — POST data to a TStruct from custom HTML page

```javascript
function saveAttendance() {
    var empId  = document.getElementById("empId").value;
    var date   = document.getElementById("date").value;
    var status = document.getElementById("status").value;

    $.ajax({
        type: "POST",
        url: "/YourApp/AxpertService.aspx/SaveData",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            transid: "attendancef1",
            empid: empId,
            attdate: date,
            attstatus: status
        }),
        dataType: "json",
        success: function(response) {
            var result = response.d.split('~');
            if (result[0]) {
                showAlertDialog("info", "Attendance saved successfully.");
            } else {
                showAlertDialog("error", result[1]);
            }
        },
        failure: function(err) {
            showAlertDialog("error", "Failed to save.");
        }
    });
}
```

---

## 13. Quick Reference Cheat Sheet

### Data Source Functions

| Function | Purpose | Where Used |
|---|---|---|
| `GetIViewData(name, params, page, size, cb)` | Fetch IView (data source) rows as JSON | HTML Plug-ins, Custom screens |
| `GetIViewParams(name, cb)` | Get parameter definitions of an IView | HTML Plug-ins, Custom screens |
| `GetWidgetData(id, cb)` | Fetch Axpert Widget/Card data | HTML Plug-ins, Custom screens |

### Form Control Functions (Axpert Script)

| Function | Purpose |
|---|---|
| `AxHideControls({fields})` | Hide fields/DCs on the form |
| `AxUnhideControl({fields})` | Show hidden fields/DCs |
| `AxDisableControls({fields})` | Disable fields (non-editable) |
| `AxEnableControls({fields})` | Enable disabled fields |
| `AxAllowEmpty({fields}, T)` | Make fields optional |
| `AxAllowEmpty({fields}, F)` | Make fields mandatory |
| `AxReadOnly()` | Make entire form read-only |
| `AxDcCollapse({dcname})` | Collapse a Boolean DC section |
| `AxDcExpand({dcname})` | Expand a Boolean DC section |

### Event Types

| Event | Form Control | When |
|---|---|---|
| `On Data Load` | Enabled | Existing record loaded |
| `On Form Load` | Enabled | Form opens |
| `On Field Enter` | Enabled | User enters a field |
| `On Field Exit` | Enabled | User exits a field |
| `On Click` | Enabled | User clicks a field |
| `Before Save Transaction` | Disabled | Before record is saved |
| `After Save Transaction` | Disabled | After record is saved |
| `Before Delete Transaction` | Disabled | Before record is deleted |
| `Before Cancel Transaction` | Disabled | Before cancel action |
| `On Create` | Workflow | New record created |
| `On Approve` | Workflow | Record approved |

### Custom Button Handler

```javascript
function btn{ID}onclick() { /* your logic */ }
```

### Field Selector (jQuery)

```javascript
$("#fieldname000F1").val()         // read
$("#fieldname000F1").val("value")  // write
```

### UI Helpers

```javascript
showAlertDialog("info", "message")    // info popup
showAlertDialog("error", "message")   // error popup
```

### Response Parse Pattern

```javascript
var result = response.d.split('~');
// result[0] = success flag | result[1] = message
```

---

*Reference compiled from [developer.agile-labs.com](https://developer.agile-labs.com) — Agile Labs Pvt Ltd © 2001–2023*
