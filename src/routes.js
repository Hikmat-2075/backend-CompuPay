import express from "express";
import authRoutes from "./domains/auth/auth-routes.js";
import userRoutes from "./domains/user/user-routes.js";
import departmentRoutes from "./domains/department/department-routes.js"
import positionRoutes from "./domains/position/position-routes.js";
import deductionsRoutes from "./domains/deductions/deductions-routes.js";
import attendanceRoutes from "./domains/attendance/attendance-routes.js";
import payrollRoutes from "./domains/payroll/payroll-routes.js";
import employeeAllowancesRoutes from "./domains/employeeAllowances/employeeAllowances-routes.js";
import AllowancesRoutes from "./domains/allowances/allowances-routes.js"
import employeeDeductionRoutes from "./domains/employeeDeductions/employeeDeductions-routes.js"


const router = express.Router();

const appsRoutes = [
	{
		path: "/auth",
		route: authRoutes,
	},
	{
		path: "/user",
		route: userRoutes,
	},
	{
		path: "/department",
		route: departmentRoutes,
	},
	{
		path: "/position",
		route: positionRoutes,
	},
	{
		path: "/deduction",
		route: deductionsRoutes,
	},
	{
		path: "/attendance",
		route: attendanceRoutes,
	},
	{
		path: "/payroll",
		route: payrollRoutes,
	},
	{
		path: "/employeeAllowance",
		route: employeeAllowancesRoutes,
	},
	{
		path: "/allowances",
		route: AllowancesRoutes,
	},
	{
		path: "/employeeDeduction",
		route: employeeDeductionRoutes,
	}
];

appsRoutes.forEach(({ path, route }) => {
	router.use(`/v1${path}`, route);
});

export default router;
