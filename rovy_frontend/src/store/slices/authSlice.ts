import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "../../services/auth";
import { AuthResponse, User, OnboardingData, Profile } from "../../types/auth";
import { LoginFormData, SignupFormData } from "../../lib/validations/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isNewUser: boolean;
  allowOnboardingEdit: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isNewUser: false,
  allowOnboardingEdit: false,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginFormData, { rejectWithValue }) => {
    try {
      const response = await authService.login(data.email, data.password);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to login");
    }
  },
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (data: SignupFormData, { rejectWithValue }) => {
    try {
      const response = await authService.signup(data.email, data.password, data.inviteCode);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to sign up");
    }
  },
);

export const completeOnboarding = createAsyncThunk(
  "auth/completeOnboarding",
  async (data: OnboardingData, { rejectWithValue }) => {
    try {
      const response = await authService.completeOnboarding(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to complete onboarding");
    }
  },
);

export const checkAuth = createAsyncThunk("auth/check", async (_, { rejectWithValue }) => {
  try {
    const token = await authService.getToken();
    if (!token) {
      return rejectWithValue("No token found");
    }
    const profile = await authService.getProfile();
    return { token, profile };
  } catch (error) {
    return rejectWithValue("Failed to restore session");
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await authService.deleteToken();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCoPilotStatus: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.coPilotProfile = { isActive: action.payload };
      }
    },
    setAllowOnboardingEdit: (state, action: PayloadAction<boolean>) => {
      state.allowOnboardingEdit = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data.user;
      state.token = action.payload.data.session.access_token;
      state.isNewUser = !action.payload.data.profile.onboardingCompleted;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.isLoading = false;
      if (action.payload.data.session) {
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.session.access_token;
        state.isNewUser = !action.payload.data.profile.onboardingCompleted;
      } else {
        state.error = "Please check your email to confirm your account.";
      }
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Complete Onboarding
    builder.addCase(completeOnboarding.fulfilled, (state, action) => {
      state.isNewUser = false;
      // if (state.user && action.payload) {
      //   state.user = { ...state.user, ...action.payload };
      // }
    });

    // Check Auth
    builder.addCase(
      checkAuth.fulfilled,
      (state, action: PayloadAction<{ token: string; profile: Profile & { email: string } }>) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = { 
          id: action.payload.profile.id, 
          email: action.payload.profile.email,
          coPilotProfile: action.payload.profile.coPilotProfile
        };
        state.isNewUser = !action.payload.profile.onboardingCompleted;
      },
    );
    builder.addCase(checkAuth.rejected, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isNewUser = false;
      state.allowOnboardingEdit = false;
    });
  },
});

export const { clearError, updateCoPilotStatus, setAllowOnboardingEdit } = authSlice.actions;
export default authSlice.reducer;
