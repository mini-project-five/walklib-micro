import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Filter,
  RefreshCw,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Calendar,
  User
} from 'lucide-react';

interface UserData {
  userId: number;
  userName: string;
  email: string;
  role: 'READER' | 'AUTHOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  registeredAt: string;
  lastLoginAt?: string;
  loginAttempts?: number;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      let url = `http://20.249.130.200/users/admin/all?page=${currentPage}&size=20`;
      
      // 검색 조건이 있을 때는 검색 API 사용
      if (searchTerm || roleFilter !== 'all' || statusFilter !== 'all') {
        url = `http://20.249.130.200/users/admin/search?page=${currentPage}&size=20`;
        
        const params = new URLSearchParams();
        if (searchTerm) params.append('userName', searchTerm);
        if (roleFilter !== 'all') params.append('role', roleFilter.toUpperCase());
        if (statusFilter !== 'all') params.append('status', statusFilter.toUpperCase());
        
        if (params.toString()) {
          url += '&' + params.toString();
        }
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setError('');
      } else {
        setError(data.error || '사용자 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('사용자 목록 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadUsers();
  };

  const handleUpdateUserStatus = async (userId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://20.249.130.200/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        loadUsers();
        setSelectedUser(null);
        alert(`사용자 상태가 ${newStatus}로 변경되었습니다.`);
      } else {
        setError(data.error || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handlePromoteToAuthor = async (userId: number) => {
    try {
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`http://20.249.130.200/users/${userId}/promote-to-author`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        loadUsers();
        setSelectedUser(null);
        alert('사용자가 작가로 승격되었습니다.');
      } else {
        setError(data.error || '작가 승격에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      setError('작가 승격 중 오류가 발생했습니다.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">관리자</Badge>;
      case 'AUTHOR':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">작가</Badge>;
      case 'READER':
        return <Badge variant="outline" className="text-green-600 border-green-600">독자</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="text-green-600 border-green-600">활성</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="text-gray-600 border-gray-600">비활성</Badge>;
      case 'SUSPENDED':
        return <Badge variant="outline" className="text-red-600 border-red-600">정지</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
          <p className="text-gray-600">전체 사용자를 관리하고 권한을 설정합니다</p>
        </div>
        <Button onClick={loadUsers} variant="outline" size="sm">
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
          <CardDescription>총 {totalElements}명의 사용자</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">사용자 검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="사용자명 또는 이메일로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="role-filter">역할 필터</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="reader">독자</SelectItem>
                  <SelectItem value="author">작가</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="status-filter">상태 필터</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="suspended">정지</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                검색
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자 정보</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(user.registeredAt)}</div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              관리
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>사용자 관리</DialogTitle>
                              <DialogDescription>
                                {user.userName}님의 계정을 관리합니다
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>사용자명</Label>
                                    <div className="p-2 bg-gray-50 rounded">{selectedUser.userName}</div>
                                  </div>
                                  <div>
                                    <Label>이메일</Label>
                                    <div className="p-2 bg-gray-50 rounded text-sm">{selectedUser.email}</div>
                                  </div>
                                  <div>
                                    <Label>현재 역할</Label>
                                    <div className="p-2">{getRoleBadge(selectedUser.role)}</div>
                                  </div>
                                  <div>
                                    <Label>현재 상태</Label>
                                    <div className="p-2">{getStatusBadge(selectedUser.status)}</div>
                                  </div>
                                </div>

                                <div>
                                  <Label>가입일</Label>
                                  <div className="p-2 bg-gray-50 rounded text-sm">{formatDate(selectedUser.registeredAt)}</div>
                                </div>

                                {selectedUser.lastLoginAt && (
                                  <div>
                                    <Label>최근 로그인</Label>
                                    <div className="p-2 bg-gray-50 rounded text-sm">{formatDate(selectedUser.lastLoginAt)}</div>
                                  </div>
                                )}

                                <div className="space-y-3 pt-4 border-t">
                                  <Label className="text-base font-medium">관리 작업</Label>
                                  
                                  <div className="space-y-2">
                                    <Label className="text-sm">상태 변경</Label>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedUser.status !== 'ACTIVE' && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleUpdateUserStatus(selectedUser.userId, 'ACTIVE')}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          활성화
                                        </Button>
                                      )}
                                      {selectedUser.status !== 'SUSPENDED' && (
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleUpdateUserStatus(selectedUser.userId, 'SUSPENDED')}
                                        >
                                          <Ban className="w-4 h-4 mr-1" />
                                          정지
                                        </Button>
                                      )}
                                      {selectedUser.status !== 'INACTIVE' && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleUpdateUserStatus(selectedUser.userId, 'INACTIVE')}
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          비활성화
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  {selectedUser.role === 'READER' && (
                                    <div className="space-y-2">
                                      <Label className="text-sm">역할 변경</Label>
                                      <Button
                                        size="sm"
                                        onClick={() => handlePromoteToAuthor(selectedUser.userId)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        <User className="w-4 h-4 mr-1" />
                                        작가로 승격
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
    </div>
  );
};

export default AdminUserManagement;