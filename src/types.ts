
export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  cover_url: string;
  file_url: string;
  created_at: string;
  user_id: string;
};

export type Profile = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
};
