# Feature Matrix — Desktop / Tablet / Mobile

> Based on `docs/use-cases.md`. Support levels:
> - ✅ Full — complete feature parity
> - ⚠️ Limited — simplified UI or reduced capability
> - ❌ Unavailable — not supported on this breakpoint

## Legend

| Role | Description |
|------|-------------|
| Member | Thành viên họ tộc |
| Creator | Người tạo họ tộc (luôn Admin) |
| Admin | Người quản trị |
| Treasurer | Thủ quỹ |
| Editor | Biên tập |
| Guest | Người chưa đăng ký (trang công khai) |

---

## 1. Clan Navigation & Identity

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| View clans I belong to (father/mother/spouse lines) | ✅ | ✅ | ✅ | Member+ |
| Switch between clans | ✅ | ✅ | ✅ | Member+ |

## 2. Family Tree & Relationships

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Interactive family tree viewer (zoom, pan, expand) | ✅ | ✅ | ⚠️ | Member+ |
| View clan members list | ✅ | ✅ | ⚠️ | Member+ |
| View my relationship to each member | ✅ | ✅ | ✅ | Member+ |
| Proper address/honorific guidance | ✅ | ✅ | ✅ | Member+ |
| Distant-relative info restriction (basic only) | ✅ | ✅ | ✅ | Member+ |

## 3. Clan Information

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Clan history & origin | ✅ | ✅ | ✅ | Member+, Guest |
| Ancestor memorial dates (ngày giỗ tổ) | ✅ | ✅ | ✅ | Member+ |
| Clan house & village location | ✅ | ✅ | ✅ | Member+, Guest |
| Notable figures (vĩ nhân) | ✅ | ✅ | ✅ | Member+, Guest |
| Clan photo gallery | ✅ | ✅ | ⚠️ | Member+, Guest |

## 4. Events — Past

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Browse past events list | ✅ | ✅ | ⚠️ | Member+ |
| Event detail with photos | ✅ | ✅ | ⚠️ | Member+ |

## 5. Events — Upcoming

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Upcoming events list | ✅ | ✅ | ⚠️ | Member+, Guest |
| Event detail (time, location, map) | ✅ | ✅ | ⚠️ | Member+, Guest |
| Add event to personal calendar | ✅ | ✅ | ✅ | Member+ |
| Event notifications | ✅ | ✅ | ✅ | Member+ |

## 6. Calendar

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Year/month event calendar view | ✅ | ✅ | ⚠️ | Member+ |
| Lunar / Solar calendar toggle | ✅ | ✅ | ✅ | Member+ |

## 7. Treasury (Quỹ Họ Tộc)

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| View current fund balance | ✅ | ✅ | ✅ | Member+ |
| Contribution & expense details | ✅ | ✅ | ⚠️ | Member+ |
| Monthly contribution/expense charts | ✅ | ✅ | ⚠️ | Member+ |
| Balance change notifications | ✅ | ✅ | ✅ | Member+ |
| Add contribution record | ✅ | ❌ | ❌ | Treasurer |
| Add expense record (reason, linked event) | ✅ | ❌ | ❌ | Treasurer |

## 8. Invitations & Sharing

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Invite known people to join clan | ✅ | ✅ | ✅ | Member+ |
| Share public clan page link | ✅ | ✅ | ✅ | Member+ |

## 9. Guest (Public Page)

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| View public clan page (history, origin, notable figures, photos) | ✅ | ✅ | ✅ | Guest |
| View upcoming events list | ✅ | ✅ | ✅ | Guest |
| Register to become a member | ✅ | ✅ | ✅ | Guest |

## 10. Admin — Member & Role Management

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| View all clan members | ✅ | ✅ | ⚠️ | Admin |
| View who holds which roles | ✅ | ✅ | ⚠️ | Admin |
| Edit member roles (except Admin) | ✅ | ❌ | ❌ | Admin |
| Reset account state (login recovery) | ✅ | ❌ | ❌ | Admin |
| Import members from GEDCOM file | ✅ | ❌ | ❌ | Admin |
| Export members to GEDCOM file | ✅ | ❌ | ❌ | Admin |
| Assign Admin role | ✅ | ❌ | ❌ | Creator, Admin |

## 11. Editor — Content Management

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Edit clan events (time, location, photos) | ✅ | ✅ | ❌ | Editor |
| Edit all clan information | ✅ | ✅ | ❌ | Editor |
| Edit clan member information | ✅ | ✅ | ❌ | Editor |

## 12. Personal Settings

| Feature | Desktop | Tablet | Mobile | Roles |
|---------|:-------:|:------:|:------:|-------|
| Edit personal info (name, birth year, gender, spouse) | ✅ | ✅ | ✅ | Member+ |
| Toggle notification preferences | ✅ | ✅ | ✅ | Member+ |
| Delete my data from the system | ✅ | ✅ | ✅ | Member+ |
| Language switch (Vietnamese / English) | ✅ | ✅ | ✅ | All |
| Light / Dark theme toggle | ✅ | ✅ | ✅ | All |

---

## Summary by Device

### Desktop — Primary workspace
Full access to every feature. Complex operations (GEDCOM import/export, role management, treasury charts, family tree editing, content management) are desktop-first.

### Tablet — Moderate workspace
Most features available with simplified layouts. Data-heavy tables and complex editors are limited. Treasury charts and admin tables use scrollable cards instead of full spreadsheets.

### Mobile — Quick access & notifications
Optimized for: viewing info, calendar checks, event reminders, notifications, personal settings, public page browsing, and invitations. Complex management tasks (admin, editor, treasurer, GEDCOM) are unavailable.
