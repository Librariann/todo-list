# Rewards System - Codebase Analysis

## 1. RewardShop Component

**File:** `/Users/librarian/Desktop/todo-list/app/components/RewardShop.tsx`  
**Lines:** 1-92 (Full file)

### Component Structure

- **Type:** Client component (`'use client'`)
- **Props Interface:**
  ```typescript
  interface RewardShopProps {
    rewards: Reward[];
    userPoints: number;
    onClaim: (reward: Reward) => void;
  }
  ```

### Key Features

- Displays rewards in a responsive grid (1 col mobile, 2 cols tablet, 4 cols desktop)
- Shows user's current points in header badge (line 20-22)
- Each reward card displays:
  - Icon (emoji from `reward.iconUrl`) - line 44
  - Name and description - lines 49-50
  - Point value in badge - line 56
  - "교환하기" (Claim) or "포인트 부족" (Insufficient Points) button - lines 62-69
  - Red badge showing deficit points if user can't afford - lines 73-77

### Styling

- Uses Tailwind CSS with gradient backgrounds for affordable rewards
- Disabled state (opacity-60) for unaffordable rewards
- Hover effects: `hover:shadow-lg hover:scale-105` for affordable items
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

## 2. mockRewards Usage in page.tsx

**File:** `/Users/librarian/Desktop/todo-list/app/page.tsx`

### Import

- **Line 37:** `mockRewards` imported from `./lib/mockData`

### Usage Location

- **Line 585:** RewardShop component rendered in "rewards" tab
  ```typescript
  <RewardShop
    rewards={mockRewards}
    userPoints={userStats.totalPoints}
    onClaim={handleClaimReward}
  />
  ```

### Related Handler

- **Lines 263-272:** `handleClaimReward` function
  ```typescript
  const handleClaimReward = (reward: Reward) => {
    if (userStats.totalPoints >= reward.value) {
      setUserStats((prev) => ({
        ...prev,
        totalPoints: prev.totalPoints - reward.value,
        earnedRewards: [...prev.earnedRewards, reward],
      }));
      alert(`🎉 ${reward.name}을(를) 획득했습니다!`);
    }
  };
  ```

---

## 3. Reward Type Definitions

**File:** `/Users/librarian/Desktop/todo-list/app/types/todo.ts`

### RewardType Enum

**Lines 27-33:**

```typescript
export enum RewardType {
  COFFEE_COUPON = 'coffee_coupon',
  GIFT_CARD = 'gift_card',
  DISCOUNT = 'discount',
  POINTS = 'points',
  CUSTOM = 'custom',
}
```

### Reward Interface

**Lines 35-42:**

```typescript
export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  iconUrl?: string;
  value: number;
}
```

### UserStats Interface (includes rewards)

**Lines 113-122:**

```typescript
export interface UserStats {
  totalPoints: number;
  earnedRewards: Reward[];
  currentStreak: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  recentRewards: Reward[];
  recentCompletedChallenges: Challenge[];
}
```

---

## 4. Existing Reward API Calls

### A. StatsPanel Component

**File:** `/Users/librarian/Desktop/todo-list/app/components/StatsPanel.tsx`  
**Line 46:**

```typescript
apiFetch(`${API_URL}/api/user/rewards/`);
```

- **Purpose:** Fetch user's earned rewards
- **Response:** Array of `RewardItem[]` with `id`, `createdAt`, `updatedAt`
- **Usage:** Displays recent rewards (first 5) in stats panel

### B. Admin Page - Rewards Management

**File:** `/Users/librarian/Desktop/todo-list/app/admin/page.tsx`

#### 1. Fetch All Rewards (Line 523)

```typescript
const res = await apiFetch(`${API_URL}/api/rewards/`);
```

- **Method:** GET
- **Purpose:** List all available rewards
- **Response:** `{ data: Reward[] }`

#### 2. Update Reward (Line 562)

```typescript
await apiFetch(`${API_URL}/api/rewards/${editId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: form.name,
    type: form.type,
    point: form.point,
    description: form.description,
    discount: form.discount,
    discountRate: form.discountRate,
  }),
});
```

#### 3. Create Reward (Line 575)

```typescript
await apiFetch(`${API_URL}/api/rewards/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(form),
});
```

#### 4. Delete Reward (Line 592)

```typescript
await apiFetch(`${API_URL}/api/rewards/${id}`, { method: 'DELETE' });
```

---

## 5. rewardUtils.ts Content

**File:** `/Users/librarian/Desktop/todo-list/app/lib/rewardUtils.ts`  
**Lines:** 1-181 (Full file)

### Exported Functions

#### 1. `calculateDailyPoints()`

**Lines 16-47**

- Calculates points earned from habits, dailies, and todos for a specific date
- **Habit points:** 10 base + streak bonus (max 50)
- **Daily points:** 15 base + streak bonus (max 75)
- **Todo points:** 5 per completed todo
- **Returns:** `number` (total points for the day)

#### 2. `calculateProgressMetrics()`

**Lines 49-84**

- Returns comprehensive progress metrics for a date
- **Returns:** `ProgressMetrics` interface with:
  - `habitsCompletedToday`, `totalHabitsToday`
  - `dailiesCompletedToday`, `totalDailiesToday`
  - `todosCompletedToday`, `totalTodosToday`
  - `averageHabitStreak`
  - `totalPointsEarned`
  - `perfectDays`

#### 3. `calculatePerfectDays()`

**Lines 86-114**

- Counts consecutive days where all habits and dailies were completed
- **Parameters:** `daysToCheck` (default 30)
- **Returns:** `number` (count of perfect days)

#### 4. `getRewardTier()`

**Lines 116-147**

- Maps total points to reward tiers
- **Tiers:**
  - 브론즈 (Bronze): 0-100
  - 실버 (Silver): 100-300
  - 골드 (Gold): 300-600
  - 플래티넘 (Platinum): 600-1000
  - 다이아몬드 (Diamond): 1000-1500
  - 마스터 (Master): 1500+
- **Returns:** Object with `tier`, `nextTierPoints`, `progress` (0-100%)

#### 5. `generateAchievements()`

**Lines 149-181**

- Generates achievement badges based on progress metrics
- **Achievements:**
  - 7+ perfect days: "🏆 완벽한 일주일 달성!"
  - 30+ perfect days: "🌟 완벽한 한 달 달성!"
  - 10+ avg habit streak: "🔥 습관 마스터"
  - All habits completed today: "💪 오늘의 모든 습관 완료!"
  - All dailies completed today: "✅ 오늘의 모든 일일목표 완료!"
  - All todos completed today: "📝 오늘의 모든 할일 완료!"
  - 100+ points earned today: "🎯 오늘 100포인트 돌파!"
- **Returns:** `string[]` (array of achievement messages)

### ProgressMetrics Interface

**Lines 4-14:**

```typescript
export interface ProgressMetrics {
  habitsCompletedToday: number;
  totalHabitsToday: number;
  dailiesCompletedToday: number;
  totalDailiesToday: number;
  todosCompletedToday: number;
  totalTodosToday: number;
  averageHabitStreak: number;
  totalPointsEarned: number;
  perfectDays: number;
}
```

---

## 6. Mock Data - mockRewards

**File:** `/Users/librarian/Desktop/todo-list/app/lib/mockData.ts`  
**Lines 18-43**

```typescript
export const mockRewards: Reward[] = [
  {
    id: '1',
    type: RewardType.COFFEE_COUPON,
    name: '스타벅스 아메리카노',
    description: '스타벅스 톨사이즈 아메리카노 쿠폰',
    value: 1000,
    iconUrl: '☕',
  },
  {
    id: '2',
    type: RewardType.GIFT_CARD,
    name: '1만원 기프트카드',
    description: '네이버페이 1만원 상품권',
    value: 5000,
    iconUrl: '🎁',
  },
  {
    id: '3',
    type: RewardType.DISCOUNT,
    name: '20% 할인쿠폰',
    description: '전 품목 20% 할인',
    value: 2000,
    iconUrl: '🎫',
  },
];
```

---

## 7. Data Flow Summary

### Points Calculation Flow

1. **Daily Points Earned** → `calculateDailyPoints()` in rewardUtils.ts
2. **User Stats Updated** → `userStats.totalPoints` in page.tsx state
3. **Display in RewardShop** → `userPoints` prop passed to RewardShop component
4. **Claim Reward** → `handleClaimReward()` deducts points and adds to `earnedRewards`

### API Integration Points

- **Fetch User Rewards:** `/api/user/rewards/` (StatsPanel)
- **Manage Rewards (Admin):** `/api/rewards/` (CRUD operations)
- **User Points:** Fetched from `/api/users/me` endpoint

---

## 8. Key Integration Notes

### Current State

- ✅ RewardShop UI fully implemented
- ✅ Mock rewards data available
- ✅ Points calculation system in place
- ✅ Admin reward management endpoints exist
- ⚠️ **No direct "claim reward" API call** - currently local state only

### Missing Integration

- No API call to `/api/rewards/claim` or similar when user claims a reward
- Reward claiming is purely client-side (local state update)
- No persistence of claimed rewards to backend

### Recommended Next Steps

1. Create `/api/rewards/claim` endpoint on backend
2. Add API call in `handleClaimReward()` to persist claim
3. Sync `earnedRewards` with backend user data
4. Add error handling for insufficient points validation on server
