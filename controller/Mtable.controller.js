sap.ui.define([
	"sap/ui/core/mvc/Controller", "sap/m/MessageToast", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v2/ODataModel",
	'sap/ui/Device', 'sap/m/SearchField', 'sap/ui/export/Spreadsheet', "sap/ui/table/Table", "sap/ui/commons/Label"
], function (Controller, MessageToast, JSONModel, Device, SearchField, Spreadsheet, Table, Label, ODataModel) {
	"use strict";
	return Controller.extend("smartTable.SmartTable.controller.Mtable", {
			onInit: function () {
			},
			/**
			 * Event handler when the add button gets pressed
			 * @public
			 */
			onOpenFormDialog: function () {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("add");
			},
			handleUploadPress: function (){
			
			//upload excel file and get json 
			var oSmartTab = this.getView().byId("smartTab");
			var oFileUploader = this.byId("fileUploader");
			oFileUploader.upload();
			if (!oFileUploader.getValue()) {
				MessageToast.show("choose a file first");
				return;
			} else {
				sap.ui.getCore().fileUploadArr = [];
				var file = oFileUploader.getFocusDomRef().files[0];
				if (file && window.FileReader) {
					var reader = new FileReader();
					reader.onload = function (e) {
						var strCSV = e.target.result;
						var bytes = new Uint8Array(strCSV);
						var data = "";
						for (var i = 0; i < bytes.byteLength; i++) {
							data += String.fromCharCode(bytes[i]);
						}
						var workbook = XLSX.read(data, {
							type: "binary"
						});
						var firstSheetName = workbook.SheetNames[0];
						var worksheet = workbook.Sheets[firstSheetName];
						var json = XLSX.utils.sheet_to_json(worksheet, {
							raw: true
						});
			//			json is our data that we have to set in the json model  
						var oModelMNA = new sap.ui.model.json.JSONModel();
						oModelMNA.setData(json);
						
						//now we have to bind data to our smart table 
						oSmartTab.setModel(oModelMNA, "oModelMNA");
						var oTable = oSmartTab.getTable();
						var aColumns = oTable.getColumns();
						for (var m = 0; m < aColumns.length; m++) {
							var sPath = "oModelMNA>" + aColumns[m].data("p13nData").columnKey;
							aColumns[m].getTemplate().getDisplay().bindText(sPath);
							aColumns[m].getTemplate().getEdit().bindValue(sPath);
						}
						oTable.bindRows("oModelMNA>/");
						oSmartTab.setTable(oTable);
					};
					reader.readAsArrayBuffer(file);
				}
			}
		}
	});
});