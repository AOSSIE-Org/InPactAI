# Onboarding System Testing Guide

## 🧪 Comprehensive Testing Checklist

This guide will help you test all aspects of the new onboarding system.

---

## Pre-Testing Setup

### 1. Environment Check

- [ ] Backend is running (`uvicorn app.main:app --reload`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Database tables are set up (see `DATABASE_STORAGE_SETUP.md`)
- [ ] Storage buckets are created
- [ ] Environment variables are configured

### 2. Database Reset (Optional)

If you want to test fresh, reset onboarding for test users:

```sql
-- Reset onboarding_completed for a specific user
UPDATE profiles
SET onboarding_completed = false
WHERE email = 'test@example.com';

-- Delete creator/brand profiles to test onboarding again
DELETE FROM creators WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com');
DELETE FROM brands WHERE user_id = (SELECT id FROM profiles WHERE email = 'test@example.com');
```

---

## 🎯 Test 1: Login Flow with Onboarding Check

### Test 1A: New User (First Login)

**Expected**: User should be redirected to onboarding

1. Sign up a new Creator user
2. Login with the new credentials
3. **Expected Result**: Redirected to `/creator/onboarding`
4. **Check Console**: No errors in browser console

### Test 1B: Existing User (Not Completed)

**Expected**: User should be redirected to onboarding

1. Use a user account where `onboarding_completed = false`
2. Login
3. **Expected Result**: Redirected to onboarding page
4. **Verify**: Check database that `onboarding_completed` is still `false`

### Test 1C: Existing User (Completed)

**Expected**: User should go directly to home

1. Use a user account where `onboarding_completed = true`
2. Login
3. **Expected Result**: Redirected to home page (not onboarding)
4. **Verify**: No onboarding screens shown

---

## 👤 Test 2: Creator Onboarding Flow

### Step-by-Step Testing

#### Step 1: Welcome Screen

- [ ] Welcome message displays correctly
- [ ] "Let's Get Started" button is visible
- [ ] Progress bar shows "1 / 10"
- [ ] Click "Let's Get Started" advances to next step

#### Step 2: Display Name

- [ ] Input field is auto-focused
- [ ] Can type in the field
- [ ] Validation: Less than 2 characters shows error
- [ ] Validation: 2+ characters enables Continue button
- [ ] Pressing Enter advances to next step
- [ ] Back button is visible and works

#### Step 3: Bio & Tagline

- [ ] Tagline input is optional (can skip)
- [ ] Bio textarea accepts input
- [ ] Character counter shows "X/500"
- [ ] Validation: Less than 50 characters disables Continue
- [ ] Validation: 50+ characters enables Continue
- [ ] Cannot exceed 500 characters

#### Step 4: Primary Niche

- [ ] Dropdown shows all niche options
- [ ] Selecting a niche enables Continue button
- [ ] Selected niche is stored

#### Step 5: Secondary Niches

- [ ] Multi-select displays all niches except primary
- [ ] Can select multiple options
- [ ] Selected items show checkmark
- [ ] "Clear all" button works
- [ ] Selection counter updates
- [ ] Can skip (Continue is always enabled)

#### Step 6: Social Media

- [ ] Can select platform from dropdown
- [ ] Can enter username/handle
- [ ] Can select follower range
- [ ] "Add Platform" button works
- [ ] Added platforms show in list with correct info
- [ ] Can remove added platforms
- [ ] Continue disabled until at least 1 platform added
- [ ] Can add multiple platforms

#### Step 7: Content Details

- [ ] Content types multi-select works
- [ ] Must select at least 1 content type
- [ ] Posting frequency dropdown works
- [ ] Content languages multi-select works
- [ ] Must select at least 1 language
- [ ] Continue enabled only when all required fields filled

#### Step 8: Collaboration Preferences

- [ ] All collaboration types shown
- [ ] Can select multiple options
- [ ] Must select at least 1
- [ ] Selection state persists

#### Step 9: Profile Picture

- [ ] Can click to upload
- [ ] Can drag & drop image
- [ ] Shows preview after upload
- [ ] "Remove" button works
- [ ] File validation: Rejects files over 5MB
- [ ] File validation: Rejects non-image files
- [ ] Can skip (Continue always enabled)

#### Step 10: Review & Submit

- [ ] Shows all entered data correctly
- [ ] Display name is correct
- [ ] Bio is correct
- [ ] Primary niche is correct
- [ ] Social platforms list is correct
- [ ] All other fields display correctly
- [ ] "Complete Profile" button is visible
- [ ] Clicking "Complete Profile" shows loading state
- [ ] After submission, redirects to `/creator/home`

### Post-Submission Checks

- [ ] Check database: Creator record exists
- [ ] Check database: All fields saved correctly
- [ ] Check database: `onboarding_completed = true`
- [ ] Check storage: Profile picture uploaded (if provided)
- [ ] Login again: Goes to home, not onboarding

---

## 🏢 Test 3: Brand Onboarding Flow

### Step-by-Step Testing

#### Step 1: Welcome Screen

- [ ] Welcome message for brands displays
- [ ] "Let's Get Started" button works
- [ ] Progress bar shows "1 / 11"

#### Step 2: Company Basics

- [ ] Company name input works (required)
- [ ] Validation: Min 2 characters
- [ ] Company tagline input works (optional)
- [ ] Both fields persist

#### Step 3: Industry

- [ ] Dropdown shows all industry options
- [ ] Can select industry
- [ ] Continue enabled after selection

#### Step 4: Company Description

- [ ] Description textarea works
- [ ] Character counter shows "X/500"
- [ ] Min 50 characters validation
- [ ] Website URL input works (required)
- [ ] Company size dropdown works (required)
- [ ] Continue enabled when all fields valid

#### Step 5: Target Audience

- [ ] Age groups multi-select works
- [ ] Genders multi-select works
- [ ] Locations multi-select works
- [ ] Interests multi-select works (optional)
- [ ] Must select at least one from each required field
- [ ] Selection counters update

#### Step 6: Brand Identity

- [ ] Brand values multi-select works
- [ ] Brand personality multi-select works
- [ ] Must select at least one from each
- [ ] Clear all buttons work

#### Step 7: Marketing Goals

- [ ] All goal options displayed
- [ ] Can select multiple
- [ ] Must select at least 1
- [ ] Selection state persists

#### Step 8: Budget & Campaign Info

- [ ] Monthly budget dropdown works
- [ ] Campaign budget dropdown works
- [ ] Campaign types multi-select works
- [ ] All fields required
- [ ] Continue enabled when all filled

#### Step 9: Creator Preferences

- [ ] Preferred niches multi-select works
- [ ] Creator sizes multi-select works
- [ ] Min followers input works (optional, number only)
- [ ] Required fields must be filled
- [ ] Optional field can be skipped

#### Step 10: Company Logo

- [ ] Image upload works
- [ ] Drag & drop works
- [ ] Preview shows
- [ ] Remove button works
- [ ] File validation works
- [ ] Can skip (optional)

#### Step 11: Review & Submit

- [ ] All entered data displays correctly
- [ ] Company info is correct
- [ ] Target audience info is correct
- [ ] Budget info is correct
- [ ] Creator preferences are correct
- [ ] "Complete Profile" button works
- [ ] Shows loading state during submission
- [ ] Redirects to `/brand/home` after success

### Post-Submission Checks

- [ ] Check database: Brand record exists
- [ ] Check database: All fields saved correctly
- [ ] Check database: `onboarding_completed = true`
- [ ] Check storage: Logo uploaded (if provided)
- [ ] Login again: Goes to home, not onboarding

---

## ⌨️ Test 4: Keyboard Navigation

### Enter Key

- [ ] Pressing Enter on any step advances (if validation passes)
- [ ] Enter works on text inputs
- [ ] Enter works on dropdowns (after selection)
- [ ] Enter does not submit if validation fails

### Backspace Key

- [ ] Pressing Backspace goes back (not on step 1)
- [ ] Backspace only works outside input fields
- [ ] Backspace does not delete text in inputs
- [ ] Backspace works on step 2 and beyond

### Tab Navigation

- [ ] Can tab through form fields
- [ ] Tab order is logical
- [ ] Focus indicators are visible

---

## 🎨 Test 5: UI/UX Features

### Animations

- [ ] Smooth fade-in when step loads
- [ ] Smooth fade-out when leaving step
- [ ] Progress bar animates smoothly
- [ ] Button hover effects work
- [ ] Loading spinner shows during submission

### Responsiveness

- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Text is readable on all screen sizes
- [ ] Buttons are tap-friendly on mobile

### Visual Design

- [ ] Gradient backgrounds display correctly
- [ ] Colors match brand (purple/blue gradient)
- [ ] Typography is clear and readable
- [ ] Spacing is consistent
- [ ] Progress bar is always visible at top

---

## ❌ Test 6: Error Handling

### Validation Errors

- [ ] Inline errors show for invalid inputs
- [ ] Error messages are clear and helpful
- [ ] Errors clear when input becomes valid
- [ ] Cannot proceed with invalid data

### Network Errors

- [ ] Test with backend offline: Shows error alert
- [ ] Test with slow connection: Loading state shows
- [ ] Test with failed upload: Error message shown
- [ ] Can retry after error

### Database Errors

- [ ] Test duplicate submission: Handles gracefully
- [ ] Test missing required fields: Shows error
- [ ] Test invalid data types: Validates before submission

---

## 🔄 Test 7: Data Persistence

### Navigation Between Steps

- [ ] Go to step 5, enter data, go back to step 3, go forward to step 5
- [ ] **Expected**: Data in step 5 is still there
- [ ] Test with multiple steps
- [ ] All entered data persists during session

### Form State Management

- [ ] Multi-select selections persist
- [ ] Uploaded images persist
- [ ] Added social platforms persist
- [ ] Dropdown selections persist

---

## 🔒 Test 8: Security & Permissions

### Authentication

- [ ] Cannot access onboarding without being logged in
- [ ] Redirects to login if not authenticated
- [ ] User can only create their own profile

### Authorization

- [ ] Creator user creates creator profile (not brand)
- [ ] Brand user creates brand profile (not creator)
- [ ] Cannot create profile for another user

### File Upload Security

- [ ] Cannot upload files larger than 5MB
- [ ] Cannot upload non-image files
- [ ] Files are stored in user-specific folders
- [ ] Cannot overwrite another user's files

---

## 🎯 Test 9: Edge Cases

### Empty States

- [ ] Test submitting without optional fields: Works
- [ ] Test with minimum required data: Works
- [ ] Test with maximum data (all optionals filled): Works

### Special Characters

- [ ] Test display name with special characters
- [ ] Test bio with emojis
- [ ] Test URL with query parameters
- [ ] All save correctly

### Large Inputs

- [ ] Test bio with exactly 500 characters: Accepts
- [ ] Test bio with 501 characters: Blocks
- [ ] Test very long company name: Handles gracefully

### Multiple Sessions

- [ ] Open onboarding in two tabs
- [ ] Complete in one tab
- [ ] Check other tab: Should redirect after completion

---

## 📊 Test 10: Database Verification

After completing onboarding, verify in database:

```sql
-- Check profiles table
SELECT id, email, role, onboarding_completed
FROM profiles
WHERE email = 'test@example.com';
-- Expected: onboarding_completed = true

-- Check creators table (for creator user)
SELECT *
FROM creators
WHERE user_id = (SELECT id FROM profiles WHERE email = 'creator@test.com');
-- Expected: All fields populated correctly

-- Check brands table (for brand user)
SELECT *
FROM brands
WHERE user_id = (SELECT id FROM profiles WHERE email = 'brand@test.com');
-- Expected: All fields populated correctly

-- Check storage
SELECT name, metadata
FROM storage.objects
WHERE bucket_id IN ('profile-pictures', 'brand-logos');
-- Expected: Uploaded files exist
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property 'id' of null"

**Cause**: User not authenticated
**Solution**: Check authentication before accessing onboarding

### Issue: Profile picture not uploading

**Cause**: Storage bucket not public or policy missing
**Solution**: Verify storage bucket is public and policies are set

### Issue: Validation not working

**Cause**: Form data not updating
**Solution**: Check state updates in form handlers

### Issue: Redirect not working after completion

**Cause**: onboarding_completed not updating
**Solution**: Check database update query and permissions

---

## ✅ Final Acceptance Criteria

All tests must pass:

- [ ] Login flow checks onboarding status correctly
- [ ] Creator onboarding (10 steps) works end-to-end
- [ ] Brand onboarding (11 steps) works end-to-end
- [ ] Keyboard navigation works throughout
- [ ] All form validations work
- [ ] Image uploads work for both roles
- [ ] Data persists across steps
- [ ] Data saves correctly to database
- [ ] onboarding_completed flag updates
- [ ] Redirects work correctly after completion
- [ ] Responsive on all screen sizes
- [ ] No console errors during flow
- [ ] Error handling works for all error cases
- [ ] Security checks pass (authentication, authorization)
- [ ] Completed users don't see onboarding again

---

## 🎉 Success!

If all tests pass, your onboarding system is production-ready! 🚀

**Next Steps:**

1. Test with real users
2. Gather feedback
3. Monitor completion rates
4. Implement Phase 2 features (optional)

---

## 📝 Test Report Template

After testing, document results:

```
Test Date: [DATE]
Tester: [NAME]
Environment: [dev/staging/production]

✅ Passed Tests: [COUNT]
❌ Failed Tests: [COUNT]
⚠️ Issues Found: [LIST]

Critical Issues:
- [Issue 1]
- [Issue 2]

Minor Issues:
- [Issue 1]
- [Issue 2]

Recommendations:
- [Recommendation 1]
- [Recommendation 2]

Overall Status: [PASS/FAIL/NEEDS WORK]
```
