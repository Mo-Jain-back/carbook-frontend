import dayjs, { Dayjs } from "dayjs";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { getMonth } from "./getTime";

interface ViewStoreType {
  selectedView: string;
  setView: (value: string) => void;
}

interface UserStore {
  name: string;
  setName: (value: string) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  userId: number;
  setUserId: (value: number) => void;
}

export type Car = {
  id: number;
  brand: string;
  model: string;
  plateNumber: string;
  imageUrl: string;
  colorOfBooking: string;
  price: number;
  ongoingBooking: number;
  upcomingBooking: number;
  status: string;
  photos:string[];
};

interface CarStore {
  cars: Car[];
  setCars: (value: Car[]) => void;
}

interface DateStoreType {
  userSelectedDate: Dayjs;
  setDate: (value: Dayjs) => void;
  twoDMonthArray: dayjs.Dayjs[][];
  selectedMonthIndex: number;
  setMonth: (index: number) => void;
}

export type CalendarEventType = {
  id: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  status: string;
  startTime: string;
  endTime: string;
  color: string;
  allDay: boolean;
  customerName: string;
  customerContact: string;
  carId: number;
  carName: string;
  isAdmin: boolean;
};

type EventStore = {
  events: CalendarEventType[];
  isEventSummaryOpen: boolean;
  selectedEvent: CalendarEventType | null;
  setEvents: (events: CalendarEventType[]) => void;
  openEventSummary: (event: CalendarEventType) => void;
  closeEventSummary: () => void;
};

type ServerStore ={
  isServerLoading: boolean;
  setIsServerLoading: (isServerLoading:boolean) => void;
  isInitiateComplete:boolean;
  setIsInitiateComplete: (isInitiateComplete:boolean) => void;
}

interface ToggleSideBarType {
  isSideBarOpen: boolean;
  setSideBarOpen: (flag: boolean) => void;
}

type EventRow = { id: string; rowIndex: number };

type EventStore1 = {
  eventsRow: EventRow[];
  setEventsRow: (eventsRow: EventRow[]) => void;
};

interface SearchStore {
  startDate: Date;
  setStartDate: (value: Date) => void;
  endDate: Date | null;
  setEndDate: (value: Date | null) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
}

export const useEventRows = create<EventStore1>((set) => ({
  eventsRow: [],
  setEventsRow: (eventsRow) => set({ eventsRow }),
}));

export const useServerStore = create<ServerStore>((set) => ({
  isServerLoading: false,
  setIsServerLoading: (isServerLoading:boolean) => set({ isServerLoading }),

  isInitiateComplete: false, // Track if InitiateScreen has disappeared
  setIsInitiateComplete: (status:boolean) => set({ isInitiateComplete: status }),
}));

export type WrappedEvent = {
  id: string;
  startDate: Dayjs;
  endDate: Dayjs;
};

type WrappedEventStore = {
  wrappedEvents: WrappedEvent[];
  setWrappedEvents: (eventsRow: WrappedEvent[]) => void;
};

export const useWrappedEvent = create<WrappedEventStore>((set) => ({
  wrappedEvents: [],
  setWrappedEvents: (wrappedEvents) => set({ wrappedEvents }),
}));

export const useSearchStore = create<SearchStore>()(
  devtools(
    persist(
      (set) => ({
        startDate: new Date(),
        setStartDate: (value: Date) => {
          set({ startDate: value });
        },
        endDate: new Date(),
        setEndDate: (value: Date | null) => {
          set({ endDate: value });
        },
        startTime: "8:30 AM",
        setStartTime: (value: string) => {
          set({ startTime: value });
        },
        endTime: "8:30 AM",
        setEndTime: (value: string) => {
          set({ endTime: value });
        },
        isSearching: false,
        setIsSearching: (value: boolean) => {
          set({ isSearching: value });
        },
      }),
      { name: "user_data", skipHydration: true },
    ),
  ),
);

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        name: "",
        setName: (value: string) => {
          set({ name: value });
        },
        imageUrl: "",
        setImageUrl: (value: string) => {
          set({ imageUrl: value });
        },
        userId: -1,
        setUserId: (value: number) => {
          set({ userId: value });
        },
      }),
      { name: "user_data", skipHydration: true },
    ),
  ),
);

export const useCarStore = create<CarStore>()(
  devtools(
    persist(
      (set) => ({
        cars: [],
        setCars: (cars) => set({ cars }),
      }),
      { name: "car_data", skipHydration: true },
    ),
  ),
);

export const useViewStore = create<ViewStoreType>()(
  devtools(
    persist(
      (set) => ({
        selectedView: "month",
        setView: (value: string) => {
          set({ selectedView: value });
        },
      }),
      { name: "calendar_view", skipHydration: true },
    ),
  ),
);

export const useDateStore = create<DateStoreType>()(
  devtools(
    persist(
      (set) => ({
        userSelectedDate: dayjs(),
        twoDMonthArray: getMonth(),
        selectedMonthIndex: dayjs().month(),
        setDate: (value: Dayjs) => {
          set({ userSelectedDate: value });
        },
        setMonth: (index) => {
          set({ twoDMonthArray: getMonth(index), selectedMonthIndex: index });
        },
      }),
      { name: "date_data", skipHydration: true },
    ),
  ),
);

export const useEventStore = create<EventStore>()(
  persist(
    devtools((set) => ({
      events: [],
      isEventSummaryOpen: false,
      selectedEvent: null,
      setEvents: (events) => set({ events: events }),
      openEventSummary: (event: CalendarEventType) =>
        set({ isEventSummaryOpen: true, selectedEvent: event }),
      closeEventSummary: () =>
        set({ isEventSummaryOpen: false, selectedEvent: null }),
    })),
    {
      name: "event-store", // Storage key in localStorage
      partialize: (state) => ({
        events: state.events, // Persist only necessary fields
        selectedEvent: state.selectedEvent,
      }),
    },
  ),
);

export const useToggleSideBarStore = create<ToggleSideBarType>()(
  devtools(
    persist(
      (set) => ({
        isSideBarOpen: true,
        setSideBarOpen: (flag: boolean) => {
          set({ isSideBarOpen: flag });
        },
      }),
      { name: "sidebar_state" },
    ),
  ),
);

// Cannot update a component (`MappingEvents`) while rendering a different component (`CarsFilters`). To locate the bad setState() call inside `CarsFilters`, follow the stack trace as described in https://react.dev/link/setstate-in-render
