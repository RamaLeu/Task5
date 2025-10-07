import axios from 'axios';
import '../../css/main/dashboard.scss'
import { logout, checkForBadSession } from '../../utils/authService';
import { useNavigate } from "react-router";
import { usePulsy } from 'pulsy';
import { useEffect, useState } from 'react';
import { validateToken } from '../../utils/authService';
function Dashboard() {
  let [users, setUsers] = useState([]);
  let [displayUsers, setDisplayUsers] = useState([]);
  let [allChecked, setAllChecked] = useState(false);
  let [currentSort, setCurrentSort] = useState('name');
  let [sortType, setSortType] = useState('string');
  let [sortDirection, setSortDirection] = useState('desc');
  let [searchParam, setSearchParam] = useState('');

  let navigate = useNavigate();
    function userLogout(){
        logout()
        navigate('/')
    }
    function getUsers(){
      axios.get(process.env.REACT_APP_API_URL + '/users/'
            ).then((res)=>{
            if(res.status === 200){
                resyncUsers(res.data.data)
            }
        }).catch(err=>{
            checkForBadSession(err, logout, navigate);
            console.log('error getting users')
        })
    }

    function sortUsers(userList, sortKey, sortType, direction, searchParam){ 
      let usersCopy = [...userList]
      if(sortKey && sortType){
        if(sortType === 'string'){
          if(direction === 'asc'){
            usersCopy.sort((a, b)=>b[sortKey].localeCompare(a[sortKey]))
          }else{
            usersCopy.sort((a, b)=>a[sortKey].localeCompare(b[sortKey]))
          }
        }
        if(sortType === 'status'){
          if(direction === 'asc'){
            usersCopy.sort((a,b)=>getUserStatus(a).localeCompare(getUserStatus(b)))
          }else{
            usersCopy.sort((a,b)=>getUserStatus(b).localeCompare(getUserStatus(a)))
          }
        }
        if(sortType === 'date'){
          if(direction === 'asc'){
            usersCopy.sort((a,b)=>{
              return getLastSeen(a, 'sort') > getLastSeen(b, 'sort') })
          }else{
            usersCopy.sort((a,b)=>
              {
                return getLastSeen(b, 'sort') > getLastSeen(a, 'sort')})
          }
        }
      }

      if(searchParam){
        usersCopy = usersCopy.filter((user)=>{
          return (user.email.toLowerCase().includes(searchParam.toLowerCase()) || user.name.toLowerCase().includes(searchParam.toLowerCase()))
        })
      }
      setDisplayUsers(usersCopy)
    }
    function setSort(key, type){
      setCurrentSort(key);
      setSortType(type);
      let direction = sortDirection
      if(currentSort === key){
        if(direction === 'asc'){
          direction = 'desc'
          setSortDirection('desc');
        }else{
          direction = 'asc'
          setSortDirection('asc');
        }
      }else{
        direction = 'desc'
        setSortDirection('desc')
      }
      sortUsers(users, key, type, direction, searchParam);
    }

    function searchFilter(e){
      setSearchParam(e.target.value);
      sortUsers(users, currentSort, sortType, sortDirection, e.target.value)
    }

    function resyncUsers(userList){
      setUsers(userList);
      setAllChecked(false);
      sortUsers(userList, currentSort, sortType, sortDirection, searchParam);
    }
    function checkRow(value, row){
      row.checked = value;
      setUsers([...users])
      if(value === false){
        setAllChecked(false)
      }
    }
    function checkAllRows(){
      users.forEach((user)=>{
        if(!allChecked){
          checkRow(true, user)

        }else{
          checkRow(false, user)
        }
      })
      if(!allChecked){
        setAllChecked(true)
      }
    }
    function deleteUsers(){
      let checkedIds = getCheckedIds();
      if(checkedIds.length > 0){
        axios.post(process.env.REACT_APP_API_URL + '/users/delete', checkedIds
            ).then((res)=>{
            resyncUsers(res.data.data)
        }).catch(err=>{
            console.log('error deleting users')
            checkForBadSession(err, logout, navigate);
        })
      }
    }

    function toggleBlockUsers(value){
      let checkedIds = getCheckedIds();
      let data = {
        users: checkedIds,
        value: value,
      }
      if(checkedIds.length > 0){
        axios.post(process.env.REACT_APP_API_URL + '/users/block', data)
        .then((res)=>{
            resyncUsers(res.data.data)
        }).catch(err=>{
            console.log('error blocking users')
            checkForBadSession(err, logout, navigate);
        })
      }
    }
    function getCheckedIds(){
      let checkedIds = [];
      users.forEach((user)=>{
        if(user.checked){
          checkedIds.push(user.id);
        }
      })
      return checkedIds;
    }


    function getUserStatus(user){
      if(!user.blocked && user.verified){
        return 'Active'
      }else if(!user.verified && !user.blocked){
        return 'Unverified'
      }else{
        return 'Blocked'
      }
    }

    function getLastSeen(user, type= null){
      var startDate = new Date();
      var endDate = new Date(user.last_visit);
      let diffInSeconds = (startDate.getTime() - endDate.getTime()) / 1000
      let hours = diffInSeconds / 3600
      if(hours >= 1){
        diffInSeconds -= hours * 3600
      }
      let minutes = diffInSeconds / 60
      if(minutes >= 1){
        diffInSeconds -= minutes * 60
      }
      if(type == null){
        return [hours, minutes]
      }else if(type === 'sort'){
        return (startDate.getTime() - endDate.getTime()) / 1000
      }
    }

    function sortArrow(name){
      let isCurrentSort = currentSort === name;
      let svgObject = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
                      </svg>
      if(sortDirection === 'asc'){
        svgObject = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
                    </svg>
      }

      return [isCurrentSort, svgObject]
    }

    const [auth] = usePulsy('auth');

    useEffect(()=>{
      if(!auth.user || !auth.authToken){
        navigate('/');
      }else{
        if(auth.authToken){
              validateToken(auth.authToken).then((isValid)=>{
                if(isValid){
                  getUsers();
                }else{
                  navigate('/');
                }
            })
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  return (
    <div className="main-window">
        <div className='main-header d-flex justify-content-center justify-content-lg-end p-3 gap-4 align-items-center'>
          {(auth.user && auth.user.verified === 0) && <div className='email-unverified'>Your email is unverified! Please check your email for verification link!</div>}
          {auth.user && <div className='user-info'>
            Logged in as: <span className='bold'>{auth.user.email}</span>
          </div>}
          <button onClick={userLogout} className="btn btn-outline-light me-2">Logout</button>
        </div>
        <div className='main-table-container p-lg-5 d-flex flex-column gap-2'>
          <div className='above-table'>
            <span className='title-container'>Users list</span>
          </div>
          <div className='table-container-inside table-responsive'>
            <div className='toolbar d-flex p-2'>
              <div className='toolbar-segment'>
                <div className='custom-button block-btn' onClick={(e)=>{toggleBlockUsers(true)}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#96aff6" className="bi bi-lock-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"/>
                  </svg>
                  <span>Block</span>
                </div>
                <div className='custom-button block-btn' onClick={(e)=>{toggleBlockUsers(false)}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#96aff6" className="bi bi-lock-fill" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 0a4 4 0 0 1 4 4v2.05a2.5 2.5 0 0 1 2 2.45v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-5a2.5 2.5 0 0 1 2-2.45V4a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v2h6V4a3 3 0 0 0-3-3"/>
                  </svg>
                  <span>Unblock</span>
                </div>
                <div className='custom-button delete-btn' onClick={(e)=>{deleteUsers()}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#bd3d43" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                </svg>
                </div>
              </div>
              <div className='toolbar-segment'>
                <input name="filter" type="text" className="form-control" aria-describedby="userFilter" placeholder="Filter" onChange={(e)=>{searchFilter(e)}}/>
              </div>
            </div>
            <table className='table border'>
              <thead className='table-dark'>
                <tr>
                  <th scope="col">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultChecked={allChecked} onChange={(e)=>{checkAllRows()}} value="" key={`all-checkbox-${allChecked}`}/>
                    </div>
                  </th>
                  <th scope="col" onClick={(e)=>{setSort('name', 'string')}}>Name {sortArrow('name')[0] && sortArrow('name')[1]}</th>
                  <th scope="col" onClick={(e)=>{setSort('email', 'string')}}>Email {sortArrow('email')[0] && sortArrow('email')[1]}</th>
                  <th scope="col" onClick={(e)=>{setSort('status', 'status')}}>Status {sortArrow('status')[0] && sortArrow('status')[1]}</th>
                  <th scope="col" onClick={(e)=>{setSort('date', 'date')}}>Last seen {sortArrow('date')[0] && sortArrow('date')[1]}</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((userRow, idx)=>{
                  return <tr key={`checkbox-${userRow.checked}-${idx}`}>
                    <td><div className='checkbox-container'><div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultChecked={userRow.checked} onChange={(e)=>{checkRow(e.target.checked, userRow)}}/>
                    </div></div></td>
                    <td>{userRow.name}</td>
                    <td>{userRow.email}</td>
                    <td>{getUserStatus(userRow)}</td>
                    <td>{getLastSeen(userRow)[0].toFixed(0) >= 1 && `${getLastSeen(userRow)[0].toFixed(0)}h. `}{getLastSeen(userRow)[1].toFixed(0) < 1 &&  getLastSeen(userRow)[0].toFixed(0) < 1 ? `Less than a minute ` : `${parseInt(getLastSeen(userRow)[1].toFixed(0))}min. `}ago</td>
                  </tr>
                })}
              </tbody>
            </table>
          </div>

        </div>
    </div>
  );
}

export default Dashboard;
