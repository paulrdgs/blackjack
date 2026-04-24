-- Remplacer la contrainte montant fixe par montant > 0
alter table public.prets drop constraint if exists prets_montant_check;
alter table public.prets add constraint prets_montant_positive check (montant > 0);
