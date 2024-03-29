interface UserPublicMetadata {
  bio?: string;
}

export default interface UserPublic {
  user_id: string;
  display_name?: string;
  avatar?: string;
  avatar_thumb?: string;
  stored_avatar?: string;
  stored_avatar_thumb?: string;
  metadata?: UserPublicMetadata;
  points: number;
  blocked: boolean;
  deleted: boolean;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
}
