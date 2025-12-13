import { useState, useEffect } from 'react';
import  Header  from '@/components/Header';
import  AdminSidebar  from '@/components/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  WithdrawalRequest,
  getWithdrawalRequests,
  updateWithdrawalRequest,
  getWalletBalance,
  updateWalletBalance,
  createTransaction,
} from '@/lib/firestore';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<WithdrawalRequest['status']>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadWithdrawals();
  }, []);

  useEffect(() => {
    filterWithdrawals();
  }, [withdrawals, searchTerm, statusFilter]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getWithdrawalRequests();
      setWithdrawals(data);
    } catch (err) {
      setError('Erro ao carregar solicitações de saque');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterWithdrawals = () => {
    let filtered = withdrawals;

    if (searchTerm) {
      filtered = filtered.filter(withdrawal =>
        withdrawal.guideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.guideEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.accountNumber.includes(searchTerm) ||
        withdrawal.bankName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(withdrawal => withdrawal.status === statusFilter);
    }

    setFilteredWithdrawals(filtered);
  };

  const handleUpdateStatus = async () => {
    if (!selectedWithdrawal) return;

    try {
      const updateData: Partial<WithdrawalRequest> = {
        status: newStatus,
        adminNotes,
        updatedAt: new Date(),
      };

      if (newStatus === 'rejected' && rejectionReason) {
        updateData.reason = rejectionReason;
      }

      if (newStatus === 'completed' || newStatus === 'approved' || newStatus === 'processing') {
        updateData.processedAt = new Date();
      }

      await updateWithdrawalRequest(selectedWithdrawal.id, updateData);
      // Sync wallet state depending on status transitions
      try {
        const guideId = selectedWithdrawal.guideId;
        const wallet = await getWalletBalance(guideId);
        const amount = selectedWithdrawal.amount;
        const prevStatus = selectedWithdrawal.status;

        if (wallet) {
          let update: any = {};
          if (newStatus === 'completed' && prevStatus !== 'completed') {
            // Move from pending to withdrawn
            const newPending = Math.max((wallet.pendingWithdrawal ?? 0) - amount, 0);
            const newTotalWithdrawn = (wallet.totalWithdrawn ?? 0) + amount;
            update.pendingWithdrawal = newPending;
            update.totalWithdrawn = newTotalWithdrawn;
            // record transaction for completion
            await createTransaction({
              guideId,
              type: 'withdrawal',
              amount: -amount,
              description: 'Saque concluído',
              balanceBefore: wallet.currentBalance ?? 0,
              balanceAfter: wallet.currentBalance ?? 0
            } as any);
          } else if (newStatus === 'rejected' && prevStatus !== 'rejected') {
            // Refund the amount to currentBalance and reduce pending
            const newPending = Math.max((wallet.pendingWithdrawal ?? 0) - amount, 0);
            const newBalance = (wallet.currentBalance ?? 0) + amount;
            update.pendingWithdrawal = newPending;
            update.currentBalance = newBalance;
            // record refund transaction
            await createTransaction({
              guideId,
              type: 'admin_adjustment',
              amount: amount,
              description: 'Reembolso por saque rejeitado',
              balanceBefore: wallet.currentBalance ?? 0,
              balanceAfter: newBalance
            } as any);
          }

          if (Object.keys(update).length > 0) {
            await updateWalletBalance(guideId, update);
          }
        }
      } catch (syncError) {
        console.error('Erro ao sincronizar carteira do guia:', syncError);
      }
      setWithdrawals(withdrawals.map(w =>
        w.id === selectedWithdrawal.id
          ? { ...w, ...updateData } as WithdrawalRequest
          : w
      ));
      setShowDialog(false);
      setSelectedWithdrawal(null);
      setAdminNotes('');
      setRejectionReason('');
    } catch (err) {
      setError('Erro ao atualizar status do saque');
      console.error(err);
    }
  };

  const getStatusColor = (status: WithdrawalRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: WithdrawalRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'processing':
        return 'Processando';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotals = () => {
    return {
      totalRequested: withdrawals.reduce((sum, w) => sum + w.amount, 0),
      totalApproved: withdrawals.filter(w => w.status === 'approved' || w.status === 'processing' || w.status === 'completed').reduce((sum, w) => sum + w.amount, 0),
      totalCompleted: withdrawals.filter(w => w.status === 'completed').reduce((sum, w) => sum + w.amount, 0),
      pendingCount: withdrawals.filter(w => w.status === 'pending').length,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 md:ml-64">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Solicitações de Saque</h1>
              <p className="text-muted-foreground mt-2">Gerencie as solicitações de saque dos guias</p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Solicitado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold">{totals.totalRequested.toFixed(2)} Kz</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Aprovado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-2xl font-bold">{totals.totalApproved.toFixed(2)} Kz</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Concluído</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-2xl font-bold">{totals.totalCompleted.toFixed(2)} Kz</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <p className="text-2xl font-bold">{totals.pendingCount}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Buscar por guia, email, conta bancária..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Withdrawals Table */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Saque ({filteredWithdrawals.length})</CardTitle>
                <CardDescription>Lista completa de solicitações de saque</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Carregando solicitações...</div>
                ) : filteredWithdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma solicitação encontrada</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Guia</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Banco</TableHead>
                          <TableHead>Conta</TableHead>
                          <TableHead>Titular</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data Solicitação</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWithdrawals.map((withdrawal) => (
                          <TableRow key={withdrawal.id}>
                            <TableCell>{withdrawal.guideName}</TableCell>
                            <TableCell className="text-xs">{withdrawal.guideEmail}</TableCell>
                            <TableCell>{withdrawal.bankName}</TableCell>
                            <TableCell className="font-mono text-xs">****{withdrawal.accountNumber.slice(-4)}</TableCell>
                            <TableCell className="max-w-xs truncate">{withdrawal.accountHolder}</TableCell>
                            <TableCell className="font-bold text-green-600">{withdrawal.amount.toFixed(2)} Kz</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(withdrawal.status)}>
                                {getStatusLabel(withdrawal.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">{formatDate(withdrawal.createdAt)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setNewStatus(withdrawal.status);
                                  setAdminNotes(withdrawal.adminNotes || '');
                                  setRejectionReason(withdrawal.reason || '');
                                  setShowDialog(true);
                                }}
                              >
                                Gerenciar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Solicitação de Saque</DialogTitle>
            <DialogDescription>
              {selectedWithdrawal?.guideName} - {selectedWithdrawal?.amount.toFixed(2)} Kz
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Status Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Status Atual</p>
              <p className="font-medium">{getStatusLabel(selectedWithdrawal?.status as any)}</p>
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">Informações Bancárias</p>
              <p className="text-sm"><strong>Banco:</strong> {selectedWithdrawal?.bankName}</p>
              <p className="text-sm"><strong>Conta:</strong> {selectedWithdrawal?.accountNumber}</p>
              <p className="text-sm"><strong>Titular:</strong> {selectedWithdrawal?.accountHolder}</p>
            </div>

            {/* New Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Novo Status</label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovar</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="rejected">Rejeitar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rejection Reason */}
            {newStatus === 'rejected' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo da Rejeição</label>
                <Textarea
                  placeholder="Explique o motivo da rejeição..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notas do Admin</label>
              <Textarea
                placeholder="Adicione notas internas sobre esta solicitação..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateStatus}>
                Atualizar Status
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
