
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminReports = () => {
  const monthlyData = [
    { month: 'Jan', appointments: 234, revenue: 35100 },
    { month: 'Fev', appointments: 267, revenue: 40050 },
    { month: 'Mar', appointments: 298, revenue: 44700 },
    { month: 'Abr', appointments: 312, revenue: 46800 },
    { month: 'Mai', appointments: 289, revenue: 43350 },
    { month: 'Jun', appointments: 325, revenue: 48750 },
  ];

  const appointmentsByType = [
    { name: 'Online', value: 68, color: '#8B5CF6' },
    { name: 'Presencial', value: 32, color: '#10B981' },
  ];

  const professionalPerformance = [
    { name: 'Dra. Ana Paula', appointments: 89, rating: 4.8 },
    { name: 'Dr. Carlos Roberto', appointments: 75, rating: 4.5 },
    { name: 'Dra. Mariana', appointments: 45, rating: 4.9 },
    { name: 'Dr. João Santos', appointments: 32, rating: 3.2 },
  ];

  const appointmentStatus = [
    { name: 'Concluídas', value: 78, color: '#10B981' },
    { name: 'Agendadas', value: 15, color: '#3B82F6' },
    { name: 'Canceladas', value: 5, color: '#EF4444' },
    { name: 'Faltaram', value: 2, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue and Appointments Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Tipo (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentsByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {appointmentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Consultas (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {appointmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Professional Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Profissionais</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={professionalPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#8B5CF6" name="Consultas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">4.6</div>
            <p className="text-sm text-muted-foreground">Avaliação Média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600">68%</div>
            <p className="text-sm text-muted-foreground">Consultas Online</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600">2.1%</div>
            <p className="text-sm text-muted-foreground">Taxa de Falta</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
