'use client';

import { useState, useEffect } from 'react';
import UserCard from '@/components/UserCard';
import MbtiTagBar from '@/components/MbtiTagBar';
import { User } from '@/types';

export default function DiscoverPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [selectedType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = selectedType
        ? `/api/users?type=${selectedType}`
        : '/api/users';
      const res = await fetch(url);
      const data = await res.json();
      // Handle both array response and {users: array} response
      const userArray = Array.isArray(data) ? data : (data.users || []);
      setUsers(userArray);
    } catch (error) {
      console.error('获取用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">发现朋友</h1>

      <MbtiTagBar
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          没有找到符合条件的用户
        </div>
      )}
    </div>
  );
}
