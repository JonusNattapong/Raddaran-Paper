import streamlit as st
import pandas as pd
from datetime import datetime
import os
import base64

# Initialize session state for papers if not exists
if 'papers' not in st.session_state:
    st.session_state.papers = pd.DataFrame(columns=[
        'id', 'title', 'author', 'category', 'description', 
        'date_added', 'file_name', 'file_data', 'template', 'sections'
    ])

# Set page config
st.set_page_config(
    page_title="Raddaran Paper Repository",
    page_icon="📚",
    layout="wide"
)

# Template definitions
TEMPLATES = {
    'research': {
        'sections': ['Abstract', 'Introduction', 'Methodology', 'Results', 'Discussion', 'Conclusion', 'References'],
        'format': 'IEEE'
    },
    'review': {
        'sections': ['Abstract', 'Introduction', 'Literature Review', 'Analysis', 'Conclusion', 'References'],
        'format': 'APA'
    },
    'technical': {
        'sections': ['Abstract', 'Problem Statement', 'Solution Approach', 'Implementation', 'Evaluation', 'References'],
        'format': 'ACM'
    }
}

# Functions for file handling
def save_file(uploaded_file):
    if uploaded_file is not None:
        return base64.b64encode(uploaded_file.getvalue()).decode()
    return None

def get_file_download_link(file_data, file_name):
    if file_data is not None:
        try:
            b64 = file_data
            return f'<a href="data:application/octet-stream;base64,{b64}" download="{file_name}">Download {file_name}</a>'
        except Exception as e:
            return "Error generating download link"
    return None

# Main app layout
st.title("📚 Raddaran Paper Repository")

# Sidebar
with st.sidebar:
    st.header("Actions")
    action = st.radio(
        "Choose action:",
        ["View Papers", "Upload Paper", "Generate Paper"]
    )

# Main content
if action == "View Papers":
    # Search and filters
    col1, col2 = st.columns([3, 1])
    with col1:
        search_term = st.text_input("🔍 Search papers", "")
    with col2:
        sort_by = st.selectbox("Sort by:", ["Date Added", "Title", "Author"])

    # Filter papers based on search
    if not st.session_state.papers.empty:
        filtered_df = st.session_state.papers[
            st.session_state.papers['title'].str.contains(search_term, case=False, na=False) |
            st.session_state.papers['author'].str.contains(search_term, case=False, na=False) |
            st.session_state.papers['description'].str.contains(search_term, case=False, na=False)
        ]

        # Sort papers
        if sort_by == "Date Added":
            filtered_df = filtered_df.sort_values('date_added', ascending=False)
        elif sort_by == "Title":
            filtered_df = filtered_df.sort_values('title')
        else:
            filtered_df = filtered_df.sort_values('author')

        # Display papers
        for _, paper in filtered_df.iterrows():
            with st.expander(f"📄 {paper['title']}"):
                col1, col2 = st.columns([3, 1])
                with col1:
                    st.write(f"**Author:** {paper['author']}")
                    st.write(f"**Category:** {paper['category']}")
                    st.write(f"**Added:** {paper['date_added']}")
                    st.write(f"**Description:**")
                    st.write(paper['description'])
                    if paper['template']:
                        st.write(f"**Template:** {paper['template']}")
                        st.write(f"**Sections:** {', '.join(eval(paper['sections']))}")
                with col2:
                    if paper['file_data']:
                        st.markdown(get_file_download_link(paper['file_data'], paper['file_name']), unsafe_allow_html=True)
                    
                    # Edit and Delete buttons
                    if st.button("✏️ Edit", key=f"edit_{paper['id']}"):
                        st.session_state.editing = paper['id']
                        st.session_state.edit_title = paper['title']
                        st.session_state.edit_author = paper['author']
                        st.session_state.edit_category = paper['category']
                        st.session_state.edit_description = paper['description']
                        st.experimental_rerun()
                    
                    if st.button("🗑️ Delete", key=f"delete_{paper['id']}"):
                        st.session_state.papers = st.session_state.papers[st.session_state.papers['id'] != paper['id']]
                        st.success("Paper deleted successfully!")
                        st.experimental_rerun()

elif action == "Upload Paper":
    st.header("Upload Paper")
    
    title = st.text_input("Paper Title")
    author = st.text_input("Author(s)")
    category = st.selectbox("Category", ["Computer Science", "Mathematics", "Physics", "Engineering"])
    description = st.text_area("Description")
    uploaded_file = st.file_uploader("Upload Paper", type=['pdf', 'doc', 'docx'])

    if st.button("Upload"):
        if title and author and category and uploaded_file:
            new_paper = {
                'id': len(st.session_state.papers) + 1,
                'title': title,
                'author': author,
                'category': category,
                'description': description,
                'date_added': datetime.now().strftime("%Y-%m-%d"),
                'file_name': uploaded_file.name,
                'file_data': save_file(uploaded_file),
                'template': None,
                'sections': None
            }
            st.session_state.papers = pd.concat([
                st.session_state.papers,
                pd.DataFrame([new_paper])
            ], ignore_index=True)
            st.success("Paper uploaded successfully!")
            st.experimental_rerun()
        else:
            st.error("Please fill in all required fields")

elif action == "Generate Paper":
    st.header("Generate Paper")
    
    template_type = st.selectbox("Select Template", ["Research Paper", "Literature Review", "Technical Report"])
    title = st.text_input("Paper Title")
    author = st.text_input("Author(s)")
    category = st.selectbox("Category", ["Computer Science", "Mathematics", "Physics", "Engineering"])
    
    template_key = template_type.lower().replace(" ", "_")
    if template_key in TEMPLATES:
        sections = TEMPLATES[template_key]['sections']
        section_content = {}
        for section in sections:
            section_content[section] = st.text_area(f"{section}")
    
    if st.button("Generate"):
        if title and author and category:
            new_paper = {
                'id': len(st.session_state.papers) + 1,
                'title': title,
                'author': author,
                'category': category,
                'description': section_content.get('Abstract', ''),
                'date_added': datetime.now().strftime("%Y-%m-%d"),
                'file_name': f"{title.lower().replace(' ', '_')}.pdf",
                'file_data': None,
                'template': template_key,
                'sections': str(sections)
            }
            st.session_state.papers = pd.concat([
                st.session_state.papers,
                pd.DataFrame([new_paper])
            ], ignore_index=True)
            st.success("Paper template generated successfully!")
            st.experimental_rerun()
        else:
            st.error("Please fill in all required fields")

# Footer
st.markdown("---")
st.markdown("*Raddaran Paper Repository - Organize and Share Academic Papers*")