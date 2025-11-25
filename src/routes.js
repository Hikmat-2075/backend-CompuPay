import express from "express";
import authRoutes from "./domains/auth/auth-routes.js";
import userRoutes from "./domains/user/user-routes.js";
import departmentRoutes from "./domains/department/department-routes.js"
import positionRoutes from "./domains/position/position-routes.js";

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
];

appsRoutes.forEach(({ path, route }) => {
	router.use(`/v1${path}`, route);
});

export default router;
