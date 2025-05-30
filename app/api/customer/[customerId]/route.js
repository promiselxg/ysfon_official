import { customerControllers } from "@/controller/customer/customersController";
import { verifyUserRoles } from "@/lib/middleware/verifyRole";
import { verifyToken } from "@/lib/middleware/verifyToken";
import ROLES from "@/lib/utils/roles";
import { withMiddleware } from "@/lib/utils/withMiddleware";

export const GET = async (req, { params }) =>
  withMiddleware(
    verifyToken,
    verifyUserRoles(ROLES.admin, ROLES.moderator, ROLES.user)
  )(req, () => customerControllers.getSingleCustomerInfo(req, params));
