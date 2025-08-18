export default () => ({
	IS3_END_POINT: process.env.IS3_END_POINT,
	IS3_ACCESS_KEY_ID: process.env.IS3_ACCESS_KEY_ID,
	IS3_SECRET_ACCESS_KEY_ID: process.env.IS3_SECRET_ACCESS_KEY_ID,
	IS3_BUCKET_NAME: process.env.IS3_BUCKET_NAME,
	IS3_REGION: process.env.IS3_REGION || "id-jakarta-1",
});
