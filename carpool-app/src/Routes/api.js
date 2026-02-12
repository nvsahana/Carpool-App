// Backend API client

// Use environment variable in production, fallback to localhost for development
export const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'  // FastAPI backend URL

/**
 * Sign up a new user with profile picture and address details
 * @param {Object} formData - Form data including profile picture
 * @returns {Promise<{id: number}>} Created user ID
 */
export async function signUp(data) {
    // Convert the plain object to FormData for file upload
    const formData = new FormData()
    
    // Append all scalar fields
    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)
    formData.append('password', data.password)
    if (data.phone) formData.append('phone', data.phone)
    
    // Company address fields
    if (data.companyAddress?.officeName) formData.append('officeName', data.companyAddress.officeName)
    if (data.companyAddress?.street) formData.append('companyStreet', data.companyAddress.street)
    if (data.companyAddress?.city) formData.append('companyCity', data.companyAddress.city)
    if (data.companyAddress?.zipcode) formData.append('companyZip', data.companyAddress.zipcode)
    
    // Home address fields
    if (data.homeAddress?.street) formData.append('homeStreet', data.homeAddress.street)
    if (data.homeAddress?.city) formData.append('homeCity', data.homeAddress.city)
    if (data.homeAddress?.zipcode) formData.append('homeZip', data.homeAddress.zipcode)
    
    // Role and preferences
    formData.append('role', data.role)
    if (data.willingToTake?.length) {
        // Append each number as a separate field - FastAPI will collect them
        data.willingToTake.forEach(num => formData.append('willingToTake', num))
    }
    if (data.hasDriversLicense !== null) {
        formData.append('hasDriversLicense', data.hasDriversLicense)
    }
    
    // Append the file last (if present)
    if (data.profile) {
        formData.append('profile', data.profile)
    }

    const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - browser will set it with boundary for FormData
        credentials: 'include'  // if you need cookies
    })

    if (!response.ok) {
        // Try to parse JSON error body
        const error = await response.json().catch(() => null)
        // If backend indicates conflict / duplicate user, throw a clear message
        if (response.status === 409 || (error && /exist/i.test(error?.detail || error?.message || ''))) {
            throw new Error('Account already exists')
        }
        throw new Error(error?.detail || error?.message || 'Signup failed')
    }

    return response.json()
}

// Add other API functions here (login, search, etc)
/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{access_token: string, token_type: string, user_id: number}>} JWT token and user info
 */
export async function login(email, password) {
    // OAuth2PasswordRequestForm expects form data with username and password fields
    const formData = new URLSearchParams()
    formData.append('username', email) // OAuth2 uses 'username' field, but we pass email
    formData.append('password', password)

    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
        credentials: 'include'
    })

    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Login failed')
    }

    return response.json()
}

/**
 * Fetch current user using stored JWT token
 */
export async function getCurrentUser() {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    const response = await fetch(`${API_BASE}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    if (!response.ok) {
        const error = await response.json().catch(()=>null)
        throw new Error(error?.detail || 'Failed to load profile')
    }
    return response.json()
}

/**
 * Get the full URL for a profile image
 * Handles both local storage and S3 URLs
 */
export function getProfileImageUrl(profilePath) {
    if (!profilePath) return null;
    
    // If it's already a full URL (S3), return as-is
    if (profilePath.startsWith('http://') || profilePath.startsWith('https://')) {
        return profilePath;
    }
    
    // Otherwise, it's a local file - get filename and construct local URL
    const filename = profilePath.split('/').pop();
    return `${API_BASE}/uploads/${filename}`;
}

/**
 * Search for carpool matches based on current user's office location
 * @param {string} searchType - 'office', 'street', or 'city'
 * @returns {Promise<Array>} Array of matching users
 */
export async function searchCarpools(searchType) {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_BASE}/search?type=${encodeURIComponent(searchType)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Search failed')
    }
    
    return response.json()
}

/**
 * Send a connection request to another user
 * @param {number} receiverId - The ID of the user to send request to
 * @returns {Promise<Object>} Created connection request
 */
export async function sendConnectionRequest(receiverId) {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const formData = new URLSearchParams()
    formData.append('receiverId', receiverId)
    
    const response = await fetch(`${API_BASE}/connection-requests`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to send connection request')
    }
    
    return response.json()
}

/**
 * Get all connection requests for the current user
 * @returns {Promise<{received: Array, sent: Array}>} Connection requests
 */
export async function getConnectionRequests() {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_BASE}/connection-requests`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to fetch connection requests')
    }
    
    return response.json()
}

/**
 * Accept a connection request
 * @param {number} requestId - The ID of the connection request
 * @returns {Promise<Object>} Updated connection request
 */
export async function acceptConnectionRequest(requestId) {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_BASE}/connection-requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to accept connection request')
    }
    
    return response.json()
}

/**
 * Reject a connection request
 * @param {number} requestId - The ID of the connection request
 * @returns {Promise<Object>} Response message
 */
export async function rejectConnectionRequest(requestId) {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_BASE}/connection-requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to reject connection request')
    }
    
    return response.json()
}

/**
 * Get all connected users (accepted connections)
 * @returns {Promise<Array>} Array of connected users
 */
export async function getConnectedUsers() {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_BASE}/connected-users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to fetch connected users')
    }
    
    return response.json()
}

/**
 * Get all conversations for the current user
 * @returns {Promise<Array>} Array of conversations
 */
export async function getConversations() {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_BASE}/conversations`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to fetch conversations')
    }
    
    return response.json()
}

/**
 * Get messages in a conversation
 * @param {number} otherUserId - The ID of the other user
 * @returns {Promise<Object>} Conversation with messages
 */
export async function getMessages(otherUserId) {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const response = await fetch(`${API_BASE}/conversations/${otherUserId}/messages`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to fetch messages')
    }
    
    return response.json()
}

/**
 * Send a message to another user
 * @param {number} otherUserId - The ID of the user to message
 * @param {string} content - Message content
 * @returns {Promise<Object>} Created message
 */
export async function sendMessage(otherUserId, content) {
    const token = localStorage.getItem('access_token')
    if (!token) throw new Error('Not authenticated')
    
    const formData = new URLSearchParams()
    formData.append('content', content)
    
    const response = await fetch(`${API_BASE}/conversations/${otherUserId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    })
    
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to send message')
    }
    
    return response.json()
}

/**
 * Get total unread message count for the current user
 * @returns {Promise<number>} Total unread message count
 */
export async function getUnreadCount() {
    const token = localStorage.getItem('access_token')
    if (!token) return 0
    
    try {
        const conversations = await getConversations()
        return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)
    } catch (err) {
        console.error('Failed to get unread count:', err)
        return 0
    }
}
