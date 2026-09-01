import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBdt } from "@/lib/format";
import { approveOrderAction, rejectOrderAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminOrdersPage() {
  await requireRole("admin");
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: { include: { course: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Confirm the TrxID in bKash/Nagad, then mark paid to unlock courses.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Student</th>
              <th className="px-3 py-2 font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">TrxID</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0">
                <td className="px-3 py-2 align-top">
                  <p className="font-medium">{order.orderId}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.map((item) => item.course.title).join(", ")}
                  </p>
                </td>
                <td className="px-3 py-2 align-top">
                  {order.user.name}
                  <br />
                  <span className="text-xs text-muted-foreground">{order.user.phone}</span>
                </td>
                <td className="px-3 py-2 align-top">
                  {formatBdt(order.totalBdt)}
                  <br />
                  <span className="text-xs uppercase">{order.method}</span>
                </td>
                <td className="px-3 py-2 align-top font-mono text-xs">
                  {order.trxId || "—"}
                </td>
                <td className="px-3 py-2 align-top">{order.status}</td>
                <td className="px-3 py-2 align-top">
                  {order.status !== "paid" && order.status !== "rejected" ? (
                    <div className="flex gap-2">
                      <form action={approveOrderAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <button type="submit" className={cn(buttonVariants({ size: "sm" }))}>
                          Mark paid
                        </button>
                      </form>
                      <form action={rejectOrderAction}>
                        <input type="hidden" name="id" value={order.id} />
                        <button
                          type="submit"
                          className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
