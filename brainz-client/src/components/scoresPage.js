import React, { Component } from 'react';
import io from 'socket.io-client';
const moment = require('moment');

class Scores extends Component {
    state = {
        endpoint: '10.150.41.155:3000',
        highscores: false,
        recentscores: false,
        onLoad: false
    }

    componentDidMount = async() => {
        // Load the scores initially before the setInterval is called in socket
        const initialScores = await this.loadInitialHighScores();
        const recentScores = await this.loadInitialRecentScores();
        this.setState({ 
            highscores: initialScores,
            recentscores: recentScores
        });

        const { endpoint } = this.state;
        const socket = io(endpoint);

        socket.on('highScores', data => {
            if (this.state.onLoad === false) {
                this.setState({ highscores: data })
                this.componentWillUnmount = () => {
                    console.log('this is test to see if it works')
                    socket.disconnect();
                }
            }
            console.log('this is data', data)
            if (data.length > this.state.highscores.length) {
                this.setState({
                    highscores: data,
                })
                console.log('changed, put changing animation here')
            } else {
                console.log('still the same, do nothing')
            }
        })

        socket.on('recentScores', data => {
            if (this.state.onLoad === false) {
                this.setState({ recentscores: data })
                this.componentWillUnmount = () => {
                    console.log('this is test to see if it works')
                    socket.disconnect();
                    // clears the interval set below
                    clearInterval(interval)
                }
            }
            console.log('this is data', data)
            if (data.length > this.state.recentscores.length) {
                this.setState({
                    recentscores: data,
                })
                //console.log('changed')
            } else {
                //console.log('still the same')
            }
        })

        // sending back data to be stored in database
        // writing loop to test if leaderboards update correctly
        let foo;
        let interval;
        let counter = 0;
        interval = setInterval(() => {
            if (counter === 20) {
                clearInterval(interval)
                counter = 0;
            } else {
                const test = moment().format('L, h:mm:ss a');
                console.log('moment', test)
                foo = {'wave': counter, 'kills': 10+counter, 'user_id': 3, 'game_mode_id': 1, 'timestamp': test}
                socket.emit('testing', foo)
                counter++
            }
        }, 5000)
        
        // socket.emit('testing', foo)

    }

    loadInitialHighScores = async () => {
        const url = `http://10.150.41.155:3000/highscores`;
        const response = await fetch(url);
        const data = response.json();
        return data;
    }

    loadInitialRecentScores = async () => {
        const url = `http://10.150.41.155:3000/recentscores`;
        const response = await fetch(url);
        const data = response.json();
        return data;
    }

    render() {
        const { highscores, recentscores } = this.state;

        return (
        <div>
            <h2>Top 10 Scores</h2>
            {(highscores !== false) ? 
            <ul>
            {highscores.map((data, index) => {
                return (
                <li key={`data${index}`}>
                    USERID: {data.user_id} Wave: {data.wave} Kills: {data.kills}
                </li>
                )
            })}
            </ul>
            : ''
            }
            <h2>Recent Games</h2>
            {(recentscores !== false) ? 
            <ul>
            {recentscores.map((data, index) => {
                return (
                <li key={`data${index}`}>
                    USERID: {data.user_id} Wave: {data.wave} Kills: {data.kills}
                </li>
                )
            })}
            </ul>
            : ''
            }
        </div>
        );
    }
}

export default Scores;
