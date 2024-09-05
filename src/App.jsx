import React, { useState } from 'react';
import CourseTabContent from './Components/CourseTabContent';
import CourseInstanceTabContent from './Components/CourseInstanceTabContent';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState('course');
    const [showCoursesTable, setShowCoursesTable] = useState(false);
    const [showInstancesTable, setShowInstancesTable] = useState(false);
    const [filterYear, setFilterYear] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [instanceKey, setInstanceKey] = useState(0); 

    const handleListCourses = () => {
        setShowCoursesTable(true);
    };

    const handleListInstances = async () => {
        setShowInstancesTable(true);
    
    };

    const handleRefresh = () => {
        setShowInstancesTable(false);
        console.log('Refresh button clicked');
        setInstanceKey(prevKey => prevKey + 1);
        setFilterYear('');            
        setFilterSemester('');        
    };

    return (
        <div className="app-container">
            <div className="tabs">
                <button 
                    className={activeTab === 'course' ? 'tab-button active' : 'tab-button'}
                    onClick={() => setActiveTab('course')}>
                    Courses
                </button>
                <button 
                    className={activeTab === 'instance' ? 'tab-button active' : 'tab-button'}
                    onClick={() => setActiveTab('instance')}>
                    Course Instance
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'course' && (
                    <>
                        <CourseTabContent showCoursesTable={showCoursesTable}/>
                        <div className="button-group">
                            <button className="button" onClick={() => setShowCoursesTable(false) }>Refresh</button>
                            <button className="button" onClick={handleListCourses}>List Courses</button>
                        </div>
                    </>
                )}
                {activeTab === 'instance' && (
                    <>
                        <CourseInstanceTabContent
                             key={instanceKey}
                            showInstancesTable={showInstancesTable}
                            setShowInstancesTable={setShowInstancesTable}
                            filterYear={filterYear}
                            setFilterYear={setFilterYear}
                            filterSemester={filterSemester}
                            setFilterSemester={setFilterSemester}
                            refreshInstances={handleRefresh}
                        />
                        <div className="button-group">
                        <button className="button" onClick={ handleRefresh} 
                        >Refresh</button>
                        <button className="button" onClick={handleListInstances}>List Instances</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
