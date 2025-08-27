import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from textblob import TextBlob
from datetime import datetime, timedelta
import json
import os

# Set page configuration
st.set_page_config(
    page_title="MicroMood - Youth Mental Health Tracker",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state for data persistence
if 'mood_data' not in st.session_state:
    st.session_state.mood_data = []

# Load existing data from file if available
DATA_FILE = 'mood_data.json'

def load_mood_data():
    """Load mood data from JSON file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                st.session_state.mood_data = data
        except Exception as e:
            st.error(f"Error loading data: {e}")

def save_mood_data():
    """Save mood data to JSON file"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(st.session_state.mood_data, f, indent=2)
    except Exception as e:
        st.error(f"Error saving data: {e}")

def analyze_sentiment(text):
    """Analyze sentiment of mood text using TextBlob"""
    try:
        blob = TextBlob(text)
        sentiment = blob.sentiment
        polarity = sentiment.polarity  # Range: -1 (negative) to 1 (positive)
        subjectivity = sentiment.subjectivity  # Range: 0 (objective) to 1 (subjective)
        
        # Convert polarity to a more intuitive scale
        if polarity >= 0.3:
            sentiment_label = "Positive"
        elif polarity <= -0.3:
            sentiment_label = "Negative"
        else:
            sentiment_label = "Neutral"
            
        return polarity, subjectivity, sentiment_label
    except Exception as e:
        st.error(f"Error analyzing sentiment: {e}")
        return 0, 0, "Neutral"

def suggest_microtask(sentiment_polarity, stress_level, mood_text):
    """Suggest personalized microtasks based on mood analysis"""
    microtasks = []
    
    # High stress level tasks
    if stress_level >= 7:
        microtasks.extend([
            "🫁 Take 5 deep breaths using the 4-7-8 technique (inhale 4, hold 7, exhale 8)",
            "🚶‍♀️ Take a 5-minute walk outside or around your room",
            "🎵 Listen to one calming song and focus only on the music",
            "💧 Drink a glass of water slowly and mindfully"
        ])
    
    # Negative sentiment tasks
    if sentiment_polarity < -0.2:
        microtasks.extend([
            "📝 Write down 3 things you're grateful for today",
            "🤗 Give yourself a 30-second hug or stretch",
            "📞 Send a quick message to someone you care about",
            "🌱 Do a 2-minute guided breathing exercise"
        ])
    
    # Neutral/positive sentiment tasks for growth
    if sentiment_polarity >= -0.2:
        microtasks.extend([
            "📄 Update one line of your resume or LinkedIn profile",
            "💻 Practice coding for 10 minutes (try a simple problem)",
            "📚 Read one article about a topic you're interested in",
            "🎯 Set one small goal for tomorrow"
        ])
    
    # Career development tasks
    career_tasks = [
        "✍️ Write a 50-word reflection on what you learned today",
        "🔍 Research one company or career path you're curious about",
        "💼 Practice answering one interview question out loud",
        "🌟 Identify one skill you want to develop this month"
    ]
    
    # Energy-based tasks
    if "tired" in mood_text.lower() or "exhausted" in mood_text.lower():
        microtasks.extend([
            "😴 Take a 5-minute power nap or rest with eyes closed",
            "☕ Make yourself a warm drink mindfully",
            "🧘‍♀️ Do gentle neck and shoulder stretches"
        ])
    elif "energetic" in mood_text.lower() or "excited" in mood_text.lower():
        microtasks.extend([
            "🏃‍♂️ Do 10 jumping jacks or pushups",
            "🎨 Spend 5 minutes on a creative activity",
            "📝 Brainstorm ideas for a project you're excited about"
        ])
    
    # Add career tasks to the pool
    microtasks.extend(career_tasks)
    
    # Return 3 random suggestions
    import random
    return random.sample(microtasks, min(3, len(microtasks)))

def create_mood_chart(data):
    """Create interactive mood chart"""
    if not data:
        return None
    
    df = pd.DataFrame(data)
    df['datetime'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('datetime')
    
    # Create subplot
    fig = go.Figure()
    
    # Add sentiment trend
    fig.add_trace(go.Scatter(
        x=df['datetime'],
        y=df['sentiment_polarity'],
        mode='lines+markers',
        name='Mood Sentiment',
        line=dict(color='#1f77b4', width=2),
        marker=dict(size=8),
        yaxis='y1'
    ))
    
    # Add stress level trend
    fig.add_trace(go.Scatter(
        x=df['datetime'],
        y=df['stress_level'],
        mode='lines+markers',
        name='Stress Level',
        line=dict(color='#ff7f0e', width=2),
        marker=dict(size=8),
        yaxis='y2'
    ))
    
    # Update layout
    fig.update_layout(
        title='Your Mood Journey Over Time',
        xaxis_title='Date',
        yaxis=dict(
            title='Sentiment Score',
            side='left',
            range=[-1, 1],
            tickmode='linear',
            tick0=-1,
            dtick=0.5
        ),
        yaxis2=dict(
            title='Stress Level',
            side='right',
            overlaying='y',
            range=[0, 10],
            tickmode='linear',
            tick0=0,
            dtick=2
        ),
        hovermode='x unified',
        height=500,
        showlegend=True
    )
    
    return fig

def main():
    # Load existing data
    load_mood_data()
    
    # Header
    st.title("🧠 MicroMood")
    st.markdown("### Your Personal Mental Health & Career Development Companion")
    
    # Sidebar for navigation
    with st.sidebar:
        st.header("Navigation")
        page = st.selectbox(
            "Choose a section:",
            ["Track My Mood", "View My Progress", "About MicroMood"]
        )
    
    if page == "Track My Mood":
        st.header("How are you feeling today?")
        
        # Mood input form
        with st.form("mood_form"):
            col1, col2 = st.columns([2, 1])
            
            with col1:
                mood_text = st.text_area(
                    "Describe your mood:",
                    placeholder="Tell me how you're feeling today... What's on your mind?",
                    height=100
                )
            
            with col2:
                stress_level = st.slider(
                    "Stress Level (0-10):",
                    min_value=0,
                    max_value=10,
                    value=5,
                    help="0 = completely relaxed, 10 = extremely stressed"
                )
            
            submitted = st.form_submit_button("Analyze My Mood", type="primary")
        
        if submitted and mood_text.strip():
            # Analyze sentiment
            polarity, subjectivity, sentiment_label = analyze_sentiment(mood_text)
            
            # Create mood entry
            mood_entry = {
                'timestamp': datetime.now().isoformat(),
                'mood_text': mood_text,
                'stress_level': stress_level,
                'sentiment_polarity': polarity,
                'sentiment_subjectivity': subjectivity,
                'sentiment_label': sentiment_label
            }
            
            # Add to session state and save
            st.session_state.mood_data.append(mood_entry)
            save_mood_data()
            
            # Display analysis results
            st.success("Mood analyzed successfully!")
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Sentiment", sentiment_label, f"{polarity:.2f}")
            with col2:
                st.metric("Stress Level", stress_level, "")
            with col3:
                subj_label = "High" if subjectivity > 0.5 else "Low"
                st.metric("Subjectivity", subj_label, f"{subjectivity:.2f}")
            
            # Suggest microtasks
            st.header("💡 Recommended Microtasks for You")
            st.write("Here are some personalized activities to help improve your wellness:")
            
            tasks = suggest_microtask(polarity, stress_level, mood_text)
            for i, task in enumerate(tasks, 1):
                st.write(f"**{i}.** {task}")
            
            st.info("💡 **Tip:** These microtasks are designed to take just 2-10 minutes. Pick one that feels right for you today!")
    
    elif page == "View My Progress":
        st.header("📊 Your Mood Journey")
        
        if not st.session_state.mood_data:
            st.info("No mood data available yet. Start tracking your mood to see your progress!")
            return
        
        # Display statistics
        df = pd.DataFrame(st.session_state.mood_data)
        
        col1, col2, col3, col4 = st.columns(4)
        with col1:
            st.metric("Total Entries", len(df))
        with col2:
            avg_sentiment = df['sentiment_polarity'].mean()
            st.metric("Avg Sentiment", f"{avg_sentiment:.2f}")
        with col3:
            avg_stress = df['stress_level'].mean()
            st.metric("Avg Stress", f"{avg_stress:.1f}")
        with col4:
            recent_trend = "📈 Improving" if len(df) >= 2 and df.iloc[-1]['sentiment_polarity'] > df.iloc[-2]['sentiment_polarity'] else "📊 Stable"
            st.metric("Recent Trend", recent_trend)
        
        # Show mood chart
        fig = create_mood_chart(st.session_state.mood_data)
        if fig:
            st.plotly_chart(fig, use_container_width=True)
        
        # Recent entries
        st.subheader("Recent Mood Entries")
        recent_df = df.tail(5).sort_values('timestamp', ascending=False)
        
        for idx, row in recent_df.iterrows():
            with st.expander(f"{row['sentiment_label']} - {pd.to_datetime(row['timestamp']).strftime('%m/%d %I:%M %p')}"):
                st.write(f"**Mood:** {row['mood_text']}")
                st.write(f"**Stress Level:** {row['stress_level']}/10")
                st.write(f"**Sentiment Score:** {row['sentiment_polarity']:.2f}")
        
        # Data management
        st.subheader("Data Management")
        if st.button("Clear All Data", type="secondary"):
            if st.checkbox("I understand this will delete all my mood data"):
                st.session_state.mood_data = []
                save_mood_data()
                st.success("All data cleared successfully!")
                st.rerun()
    
    elif page == "About MicroMood":
        st.header("About MicroMood")
        
        st.write("""
        **MicroMood** is designed specifically for young adults to support both mental health and career development through daily mood tracking and personalized microtasks.
        
        ### 🎯 Key Features:
        - **Mood Tracking**: Record your daily feelings and stress levels
        - **Sentiment Analysis**: AI-powered analysis of your emotional state using TextBlob
        - **Personalized Microtasks**: Get tailored suggestions for wellness and career growth
        - **Progress Visualization**: Track your mood trends over time with interactive charts
        - **Youth-Focused**: Activities designed for students and early-career professionals
        
        ### 🌟 Why MicroMood Helps:
        
        **Mental Health Benefits:**
        - Increases self-awareness through daily reflection
        - Provides immediate coping strategies during stressful moments
        - Helps identify patterns in mood and stress triggers
        - Encourages regular mental health check-ins
        
        **Career Development Benefits:**
        - Suggests career-building activities like resume updates and skill practice
        - Promotes consistent personal and professional growth
        - Helps build resilience and stress management skills for the workplace
        - Encourages networking and continuous learning habits
        
        ### 🔒 Privacy & Data:
        - All data is stored locally on your device
        - No personal information is shared with external services
        - You have full control over your data and can clear it anytime
        
        ### 🚀 Getting Started:
        1. Navigate to "Track My Mood" to record your first entry
        2. Describe how you're feeling and rate your stress level
        3. Get personalized microtask suggestions
        4. Check "View My Progress" to see your mood journey over time
        
        ---
        
        **Remember:** This app is a wellness tool and not a replacement for professional mental health care. If you're experiencing persistent mental health concerns, please reach out to a healthcare provider or counselor.
        """)
        
        st.info("💡 **Pro Tip:** Try to use MicroMood daily for the best insights into your mood patterns and maximum benefit from the suggested activities!")

if __name__ == "__main__":
    main()
