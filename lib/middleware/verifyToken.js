import jwt from "jsonwebtoken";
import prisma from "../utils/dbConnect";
import { customMessage } from "../utils/customMessage";
import { cookies } from "next/headers";

export async function verifyToken(req) {
  let token;

  // ✅ 1. Check Authorization header
  const authHeader = req?.headers?.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // ✅ 2. Check cookies if Authorization header is missing
  if (!token) {
    const cookieStore = cookies(); // ✅ Access cookies
    token = cookieStore.get("accessToken")?.value;
  }

  // ✅ 3. Reject if no token is found
  if (!token) {
    return customMessage(
      "You do not have the required permission to perform this action",
      {},
      401
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, roles: true, username: true },
    });

    if (!user) {
      return customMessage("User not found", {}, 404);
    }

    req.user = user;
    return;
  } catch (error) {
    return customMessage("Invalid Token", {}, 403);
  }
}
