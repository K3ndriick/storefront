import { getAllUsers } from '@/lib/actions/admin/users';

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  const customers = users.filter(u => u.role === 'customer');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {customers.length} customers · {admins.length} admin{admins.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-card border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-right px-4 py-3 font-medium">Orders</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(user => {
              const joined = new Date(user.created_at).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{user.full_name ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.phone ?? '-'}</td>
                  <td className="px-4 py-3 text-right">{user.order_count}</td>
                  <td className="px-4 py-3 text-muted-foreground">{joined}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}