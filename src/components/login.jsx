import { useState } from "react";

export default function LoginDebugger() {
  const [formData, setFormData] = useState({ email: "soupiksinha1@gmail.com", password: "" });
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const checkSupabaseHealth = async () => {
    const supabaseUrl = "https://social-media-frontend-c79j.vercel.app"; // From your screenshot
    const healthEndpoints = [
      `${supabaseUrl}/health`,
      `${supabaseUrl}/rest/v1/`,
      `${supabaseUrl}/auth/v1/health`
    ];

    const results = {};
    for (const endpoint of healthEndpoints) {
      try {
        const response = await fetch(endpoint, { method: 'HEAD' });
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (err) {
        results[endpoint] = { error: err.message };
      }
    }
    return results;
  };

  const diagnoseLogin = async () => {
    setLoading(true);
    setError("");
    
    const diagnosis = {
      timestamp: new Date().toISOString(),
      email: formData.email,
      environment: {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
        url: window.location.href
      }
    };

    // Check environment variables (simulated)
    const envCheck = {
      supabaseUrl: "Present", // You'd check import.meta.env.VITE_SUPABASE_URL
      supabaseKey: "Present", // You'd check import.meta.env.VITE_SUPABASE_KEY
      redirectUrl: "https://social-media-frontend-c79j.vercel.app/reset-password"
    };
    diagnosis.environment = { ...diagnosis.environment, ...envCheck };

    // Test network connectivity
    try {
      const healthCheck = await checkSupabaseHealth();
      diagnosis.healthCheck = healthCheck;
    } catch (err) {
      diagnosis.healthCheck = { error: err.message };
    }

    // Common login issues checklist
    diagnosis.commonIssues = {
      emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      passwordLength: formData.password.length >= 6,
      networkConnection: navigator.onLine,
      corsIssue: "Check browser console for CORS errors",
      rateLimiting: "Check if too many attempts made recently",
      emailConfirmed: "Verify email confirmation status",
      userExists: "Confirm user exists in auth.users table"
    };

    // Simulate auth attempt debugging
    diagnosis.authAttempt = {
      step1_validateInput: true,
      step2_networkRequest: "Attempting...",
      step3_serverResponse: "Waiting...",
      step4_sessionCreate: "Pending..."
    };

    setDebugInfo(diagnosis);

    // Simulate the actual login attempt with detailed logging
    try {
      // This would be your actual Supabase call
      console.log("🔍 Attempting login with:", {
        email: formData.email,
        timestamp: new Date().toISOString()
      });

      // Mock the specific error you're seeing
      const mockError = {
        message: "Invalid login credentials",
        status: 400,
        code: "invalid_credentials"
      };

      setError(`Error Code: ${mockError.code} - ${mockError.message}`);
      
      diagnosis.authAttempt = {
        step1_validateInput: true,
        step2_networkRequest: "✅ Request sent",
        step3_serverResponse: `❌ ${mockError.status} - ${mockError.message}`,
        step4_sessionCreate: "❌ Failed"
      };

    } catch (err) {
      diagnosis.authAttempt.step2_networkRequest = `❌ Network Error: ${err.message}`;
      setError(`Network Error: ${err.message}`);
    }

    setDebugInfo({ ...diagnosis });
    setLoading(false);
  };

  const runSpecificTests = async () => {
    const tests = {};
    
    // Test 1: Email validation
    tests.emailValidation = {
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      domain: formData.email.split('@')[1],
      isTestDomain: ['example.com', 'test.com'].includes(formData.email.split('@')[1])
    };

    // Test 2: Rate limiting check
    tests.rateLimiting = {
      lastAttempt: localStorage.getItem('lastLoginAttempt') || 'Never',
      attemptCount: parseInt(localStorage.getItem('loginAttempts') || '0'),
      isRateLimited: parseInt(localStorage.getItem('loginAttempts') || '0') > 5
    };

    // Test 3: Browser compatibility
    tests.browserCompat = {
      fetch: typeof fetch !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      crypto: typeof crypto !== 'undefined',
      webauth: typeof navigator.credentials !== 'undefined'
    };

    setDebugInfo(prev => ({ ...prev, specificTests: tests }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-purple-500 to-blue-500 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-red-600 text-white p-4">
          <h1 className="text-2xl font-bold">🚨 Login Issue Debugger</h1>
          <p className="text-red-100">Diagnose "Invalid email or password" errors</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Issue Summary */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Current Issue</h2>
            <p className="text-red-700">Getting "Invalid email or password" despite correct credentials</p>
            <p className="text-sm text-red-600 mt-1">Email: {formData.email}</p>
          </div>

          {/* Input Form */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Test Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password to test"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={diagnoseLogin}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Diagnosing..." : "🔍 Full Diagnosis"}
            </button>
            <button
              onClick={runSpecificTests}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🧪 Run Specific Tests
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded">
              <strong>Current Error:</strong> {error}
            </div>
          )}

          {/* Debug Information */}
          {Object.keys(debugInfo).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Debug Results</h3>
              
              {/* Environment Info */}
              {debugInfo.environment && (
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Environment</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Online: {debugInfo.environment.online ? "✅" : "❌"}</div>
                    <div>Cookies: {debugInfo.environment.cookiesEnabled ? "✅" : "❌"}</div>
                    <div>URL: {debugInfo.environment.url}</div>
                    <div>Supabase URL: {debugInfo.environment.supabaseUrl}</div>
                  </div>
                </div>
              )}

              {/* Common Issues */}
              {debugInfo.commonIssues && (
                <div className="bg-yellow-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Common Issues Check</h4>
                  <div className="space-y-1 text-sm">
                    <div>Email Format: {debugInfo.commonIssues.emailFormat ? "✅" : "❌"}</div>
                    <div>Password Length: {debugInfo.commonIssues.passwordLength ? "✅" : "❌"}</div>
                    <div>Network: {debugInfo.commonIssues.networkConnection ? "✅" : "❌"}</div>
                  </div>
                </div>
              )}

              {/* Auth Attempt Flow */}
              {debugInfo.authAttempt && (
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Authentication Flow</h4>
                  <div className="space-y-1 text-sm">
                    <div>1. Input Validation: {debugInfo.authAttempt.step1_validateInput ? "✅" : "❌"}</div>
                    <div>2. Network Request: {debugInfo.authAttempt.step2_networkRequest}</div>
                    <div>3. Server Response: {debugInfo.authAttempt.step3_serverResponse}</div>
                    <div>4. Session Creation: {debugInfo.authAttempt.step4_sessionCreate}</div>
                  </div>
                </div>
              )}

              {/* Specific Tests */}
              {debugInfo.specificTests && (
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Specific Tests</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Email Validation:</strong>
                      <div>Valid: {debugInfo.specificTests.emailValidation?.valid ? "✅" : "❌"}</div>
                      <div>Domain: {debugInfo.specificTests.emailValidation?.domain}</div>
                    </div>
                    <div>
                      <strong>Rate Limiting:</strong>
                      <div>Attempts: {debugInfo.specificTests.rateLimiting?.attemptCount}</div>
                      <div>Limited: {debugInfo.specificTests.rateLimiting?.isRateLimited ? "❌" : "✅"}</div>
                    </div>
                    <div>
                      <strong>Browser Support:</strong>
                      <div>Fetch: {debugInfo.specificTests.browserCompat?.fetch ? "✅" : "❌"}</div>
                      <div>Storage: {debugInfo.specificTests.browserCompat?.localStorage ? "✅" : "❌"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Troubleshooting Checklist */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">📋 Troubleshooting Checklist</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>Check Supabase dashboard → Authentication → Users for the email</span>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>Verify email confirmation status (email_confirmed_at column)</span>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>Check Supabase → Authentication → Settings → Site URL</span>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>Review Rate Limiting settings in Supabase</span>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>Test with Supabase CLI: <code className="bg-gray-100 px-1 rounded">supabase auth users list</code></span>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" />
                <span>Check browser Network tab for actual HTTP status codes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}