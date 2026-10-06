// Type boundary for the existing official generated runtime. No new client.
export const supabase: {
 auth: {getSession():Promise<{data:{session:{user:{id:string}}|null},error:unknown}>};
 from(table:string):any;
};
