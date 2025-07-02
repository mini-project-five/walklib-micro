import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Filter,
  RefreshCw,
  User,
  Mail,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';

interface AuthorRequest {
  authorId: number;
  authorName: string;
  email: string;
  realName: string;
  introduction: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  applicationDate: string;
  reviewedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

interface AdminAuthorApprovalProps {
  onStatsUpdate: () => void;
}

const AdminAuthorApproval: React.FC<AdminAuthorApprovalProps> = ({ onStatsUpdate }) => {
  const [authors, setAuthors] = useState<AuthorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorRequest | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 승인/거부 처리 상태
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadAuthors();
  }, [activeTab, currentPage]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      let url = '';
      if (activeTab === 'pending') {
        url = `http://20.249.130.200/admin/authors/pending?page=${currentPage}&size=20`;
      } else {
        const status = activeTab === 'all' ? '' : activeTab.toUpperCase();
        url = `http://20.249.130.200/admin/authors/all?page=${currentPage}&size=20${status ? `&status=${status}` : ''}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setAuthors(data.authors || []);
        setTotalPages(data.totalPages || 0);
        setError('');
      } else {
        setError(data.error || '작가 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading authors:', error);
      setError('작가 목록 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAuthor = async (authorId: number) => {
    try {
      setProcessingId(authorId);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://20.249.130.200/admin/authors/${authorId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: approvalNotes || '관리자 승인'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setApprovalNotes('');
        setSelectedAuthor(null);
        loadAuthors();
        onStatsUpdate();
        
        // 성공 알림 (실제 프로덕션에서는 toast 라이브러리 사용)
        alert('작가가 성공적으로 승인되었습니다.');
      } else {
        setError(data.error || '승인 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error approving author:', error);
      setError('승인 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectAuthor = async (authorId: number) => {
    if (!rejectionReason.trim()) {
      setError('거부 사유를 입력해주세요.');
      return;
    }

    try {
      setProcessingId(authorId);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://20.249.130.200/admin/authors/${authorId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectionReason: rejectionReason,
          adminNotes: rejectionReason
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRejectionReason('');
        setSelectedAuthor(null);
        loadAuthors();
        onStatsUpdate();
        
        // 성공 알림
        alert('작가 신청이 성공적으로 거부되었습니다.');
      } else {
        setError(data.error || '거부 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error rejecting author:', error);
      setError('거부 처리 중 오류가 발생했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-orange-600 border-orange-600">대기중</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600">승인됨</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600">거부됨</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">검토중</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const filteredAuthors = authors.filter(author => {
    const matchesSearch = author.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.realName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || author.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">작가 승인 관리</h2>
          <p className="text-gray-600">작가 신청을 검토하고 승인/거부를 처리합니다</p>
        </div>
        <Button onClick={loadAuthors} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="작가명, 이메일, 실명으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status-filter">상태 필터</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                  <SelectItem value="under_review">검토중</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setCurrentPage(0);
      }}>
        <TabsList>
          <TabsTrigger value="pending">승인 대기</TabsTrigger>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="approved">승인됨</TabsTrigger>
          <TabsTrigger value="rejected">거부됨</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">작가 목록을 불러오는 중...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  작가 신청 목록 ({filteredAuthors.length}건)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAuthors.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">작가 신청이 없습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>작가 정보</TableHead>
                          <TableHead>신청일</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAuthors.map((author) => (
                          <TableRow key={author.authorId}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{author.authorName}</div>
                                <div className="text-sm text-gray-600">{author.realName}</div>
                                <div className="text-sm text-gray-500">{author.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{formatDate(author.applicationDate)}</div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(author.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedAuthor(author)}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      상세
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>작가 신청 상세 정보</DialogTitle>
                                      <DialogDescription>
                                        {author.authorName}님의 작가 신청 내용입니다
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    {selectedAuthor && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>작가명</Label>
                                            <div className="p-2 bg-gray-50 rounded">{selectedAuthor.authorName}</div>
                                          </div>
                                          <div>
                                            <Label>실명</Label>
                                            <div className="p-2 bg-gray-50 rounded">{selectedAuthor.realName}</div>
                                          </div>
                                          <div>
                                            <Label>이메일</Label>
                                            <div className="p-2 bg-gray-50 rounded">{selectedAuthor.email}</div>
                                          </div>
                                          <div>
                                            <Label>신청일</Label>
                                            <div className="p-2 bg-gray-50 rounded">{formatDate(selectedAuthor.applicationDate)}</div>
                                          </div>
                                        </div>
                                        
                                        <div>
                                          <Label>작가 소개</Label>
                                          <div className="p-3 bg-gray-50 rounded max-h-32 overflow-y-auto">
                                            {selectedAuthor.introduction || '소개글이 없습니다.'}
                                          </div>
                                        </div>

                                        {selectedAuthor.status === 'PENDING' && (
                                          <div className="space-y-4 pt-4 border-t">
                                            <div>
                                              <Label htmlFor="approval-notes">승인 시 관리자 메모</Label>
                                              <Textarea
                                                id="approval-notes"
                                                placeholder="승인 사유나 메모를 입력하세요 (선택사항)"
                                                value={approvalNotes}
                                                onChange={(e) => setApprovalNotes(e.target.value)}
                                              />
                                            </div>

                                            <div>
                                              <Label htmlFor="rejection-reason">거부 사유</Label>
                                              <Textarea
                                                id="rejection-reason"
                                                placeholder="거부 시 사유를 입력하세요"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                              />
                                            </div>

                                            <div className="flex space-x-2 pt-2">
                                              <Button
                                                onClick={() => handleApproveAuthor(selectedAuthor.authorId)}
                                                disabled={processingId === selectedAuthor.authorId}
                                                className="bg-green-600 hover:bg-green-700"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                {processingId === selectedAuthor.authorId ? '처리중...' : '승인'}
                                              </Button>
                                              <Button
                                                variant="destructive"
                                                onClick={() => handleRejectAuthor(selectedAuthor.authorId)}
                                                disabled={processingId === selectedAuthor.authorId || !rejectionReason.trim()}
                                              >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                {processingId === selectedAuthor.authorId ? '처리중...' : '거부'}
                                              </Button>
                                            </div>
                                          </div>
                                        )}

                                        {selectedAuthor.adminNotes && (
                                          <div>
                                            <Label>관리자 메모</Label>
                                            <div className="p-3 bg-blue-50 rounded">
                                              {selectedAuthor.adminNotes}
                                            </div>
                                          </div>
                                        )}

                                        {selectedAuthor.rejectionReason && (
                                          <div>
                                            <Label>거부 사유</Label>
                                            <div className="p-3 bg-red-50 rounded">
                                              {selectedAuthor.rejectionReason}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>

                                {author.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAuthor(author);
                                        handleApproveAuthor(author.authorId);
                                      }}
                                      disabled={processingId === author.authorId}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      승인
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      이전
                    </Button>
                    <span className="flex items-center px-4">
                      {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAuthorApproval;