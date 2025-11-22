import express from "express";
import authRoutes from "./domains/auth/auth-routes.js";
import employeeRoutes from "./domains/employee/employee-routes.js";

const router = express.Router();

const appsRoutes = [
	{
		path: "/auth",
		route: authRoutes,
	},
	{
		path: "/employee",
		route: employeeRoutes,
	},
];

appsRoutes.forEach(({ path, route }) => {
	router.use(`/v1${path}`, route);
});

export default router;
