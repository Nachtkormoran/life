import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://komysokkazmmfklflqso.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FXe72cBJgsqBMt9ygnt5_g_mFuL4CfT';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- DOM refs ---
const overlay = document.getElementById('authOverlay');
const app = document.querySelector('.app');
const userBar = document.getElementById('userBar');
const greeting = document.getElementById('greeting');
const logoutBtn = document.getElementById('logoutBtn');

const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const errorBox = document.getElementById('authError');

// --- helpers ---
function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.add('visible');
}

function clearError() {
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
}

function setTab(tab) {
    clearError();
    const isLogin = tab === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabSignup.classList.toggle('active', !isLogin);
    loginForm.classList.toggle('hidden', !isLogin);
    signupForm.classList.toggle('hidden', isLogin);
}

function showApp(session) {
    const name = session.user.user_metadata?.name || session.user.email;
    greeting.textContent = `Hallo, ${name}`;
    overlay.classList.add('hidden');
    app.classList.remove('hidden');
    userBar.classList.remove('hidden');
}

function showAuth() {
    overlay.classList.remove('hidden');
    app.classList.add('hidden');
    userBar.classList.add('hidden');
}

// --- tab switching ---
tabLogin.addEventListener('click', () => setTab('login'));
tabSignup.addEventListener('click', () => setTab('signup'));

// --- sign up ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!name) {
        showError('Bitte einen Namen eingeben.');
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
    });

    if (error) {
        showError(error.message);
        return;
    }
    // Email confirmation is disabled, so a session is created immediately.
    // onAuthStateChange handles showing the app.
});

// --- sign in ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        showError(error.message);
    }
});

// --- sign out ---
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// --- react to auth state ---
supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
        showApp(session);
    } else {
        showAuth();
    }
});

// --- initial session check ---
const { data: { session } } = await supabase.auth.getSession();
if (session) {
    showApp(session);
} else {
    showAuth();
}
