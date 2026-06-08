import { supabase } from '../supabaseClient';

export const fetchAccess = async (email: string) => {
  const { data, error } = await supabase
    .from('access_control') // nama tabel
    .select('role, permission')
    .eq('email', email);

  if (error) {
    console.error('Error fetching access:', error);
    return [];
  }

  return data;
};

export const hasPermission = (
  accessList: { role: string; permission: string }[],
  role: string,
  type: 'Edit' | 'View'
) => {
  return accessList.some(
    (item) =>
      item.role === role &&
      (item.permission === type || (type === 'View' && item.permission === 'Edit'))
  );
};
