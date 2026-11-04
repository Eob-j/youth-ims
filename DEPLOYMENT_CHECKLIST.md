# Deployment Checklist

Complete this checklist before deploying the Youth IMS to production.

## Database Setup

- [ ] Run `scripts/auth/001_create_users_table.sql`
- [ ] Run `scripts/auth/003_add_rls_to_all_tables.sql`
- [ ] Verify all tables have RLS enabled
- [ ] Create first admin user via sign-up
- [ ] Run `scripts/auth/002_create_admin_user.sql` with admin email
- [ ] Test authentication flow (sign up, confirm email, sign in)

## Environment Variables

- [ ] `DATABASE_URL` is set
- [ ] `BETTER_AUTH_SECRET` is set
- [ ] `BETTER_AUTH_URL` is set to the production URL (e.g. `https://doysmoys.gov.gm`)
- [ ] `RESEND_API_KEY` is set
- [ ] `EMAIL_SENDER_NAME` is set
- [ ] `EMAIL_SENDER_ADDRESS` is set

## Security

- [ ] RLS is enabled on ALL data tables
- [ ] RLS policies are tested and working
- [ ] Admin role can manage users
- [ ] Data entry clerks can edit data
- [ ] Viewers can only read data
- [ ] Unauthenticated users are redirected to login

## Features

- [ ] User authentication works (sign up, sign in, sign out)
- [ ] User management interface accessible to admins only
- [ ] Data import functionality works for all tables
- [ ] All data tables display correctly
- [ ] Graphs and charts render properly
- [ ] Export functionality works

## Testing

- [ ] Create test users with different roles
- [ ] Test data entry as data_entry_clerk
- [ ] Test read-only access as viewer
- [ ] Test user management as admin
- [ ] Test data import with sample CSV files
- [ ] Test on mobile devices
- [ ] Test in different browsers

## Performance

- [ ] Database indexes are created
- [ ] Large tables load efficiently
- [ ] Queries are optimized
- [ ] Images and assets are optimized

## Documentation

- [ ] README.md is updated
- [ ] DATABASE_SETUP.md is complete
- [ ] User roles and permissions are documented
- [ ] CSV import format is documented

## Production Readiness

- [ ] All console.log statements reviewed
- [ ] Error handling is comprehensive
- [ ] Loading states are implemented
- [ ] Success/error messages are user-friendly
- [ ] Backup strategy is in place
- [ ] Monitoring is set up

## Post-Deployment

- [ ] Verify production database connection
- [ ] Test authentication in production
- [ ] Create production admin user
- [ ] Import initial data
- [ ] Train users on the system
- [ ] Set up regular backups
