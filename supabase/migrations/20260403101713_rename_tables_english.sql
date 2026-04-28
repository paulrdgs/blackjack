-- =============================================
-- Rename tables: French → English
-- =============================================

alter table public.parties rename to games;
alter table public.prets rename to loans;
alter table public.amis rename to friends;

-- =============================================
-- Rename columns: French → English
-- =============================================

-- users
alter table public.users rename column jetons to tokens;
alter table public.users rename column badge_premier_ami to badge_first_friend;
alter table public.users rename column badge_multijoueur to badge_multiplayer;
alter table public.users rename column badge_premier_skin to badge_first_skin;
alter table public.users rename column badge_victoires to badge_wins;
alter table public.users rename column badge_jetons to badge_tokens;

-- games (ex parties)
alter table public.games rename column mise to bet;
alter table public.games rename column resultat to result;

-- loans (ex prets)
alter table public.loans rename column montant to amount;
alter table public.loans rename column remboursement to repayment;
alter table public.loans rename column rembourse to repaid;

-- friends (ex amis)
alter table public.friends rename column ami_id to friend_id;

-- =============================================
-- Rename indexes
-- =============================================

alter index idx_parties_user_id rename to idx_games_user_id;
alter index idx_parties_created_at rename to idx_games_created_at;
alter index idx_prets_user_id rename to idx_loans_user_id;
alter index idx_amis_user_id rename to idx_friends_user_id;
alter index idx_amis_ami_id rename to idx_friends_friend_id;
alter index idx_users_jetons rename to idx_users_tokens;

-- =============================================
-- Rename constraints
-- =============================================

alter table public.friends rename constraint amis_unique to friends_unique;
alter table public.friends rename constraint pas_ami_soi_meme to no_self_friend;
alter table public.loans rename constraint prets_montant_positive to loans_amount_positive;
alter table public.loans rename constraint rembourse_max to repaid_max;
