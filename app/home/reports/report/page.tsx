import Reports from "@/components/pages/Reports";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { NextAuthOpt } from "@/app/util/NextAuthOpt";
async function page() {
     const session = await getServerSession(NextAuthOpt);
     const userData = session?.data;
     if (userData) {
         if (userData.role >= 4) {
             notFound();
         }
     }
  return (
      <div className="flex flex-1">
          <Reports />
      </div>
  );
}

export default page