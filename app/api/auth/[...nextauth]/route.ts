import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim());
