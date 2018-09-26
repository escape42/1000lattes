import React from 'react';

import Profile from './components/Profile';
import RequestComplete from './components/RequestComplete';

import {
  interests,
  createCookie,
  getCookies,
} from './latteHelper';

import LattesBackgroundImage from './imgs/background.png';
import LattesLogo from './imgs/1000_Lattes_logo.svg';

const postUrl =
  'https://xr9nuhdsnb.execute-api.us-west-2.amazonaws.com/Lattes/';
const interestGetUrl =
  'https://xr9nuhdsnb.execute-api.us-west-2.amazonaws.com/Lattes/userId/';

class Lattes extends React.Component {
  state = {
    isLoggedIn: false,
    isInputValid: true,
    value: '',
    userId: null,
    interests: interests.slice(),
    coffeeCount: 0,
    selectedInterests: [],
    profileSaved: false,
    matched: 'null',
    areInterestsSubmitted: false,
  };

  submitInterests = () => {
    let selectedInterests = this.state.selectedInterests;

    if (selectedInterests.length > 0) {

      const data = {
        userId: this.state.userId,
        coffeeCount: this.state.coffeeCount,
        interests: selectedInterests.map(interest => ({ S: interest })),
        matched: 'null'
      };
      const headers = new Headers({ 'Content-Type': 'application/json' });

      fetch(postUrl, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: headers
      }).then(() => {
        this.setState({
          profileSaved: true,
          areInterestsSubmitted: true,
          isInputValid: true,
          isPendingMatch: true,
        });
        createCookie('isPendingMatch', true, 1);
      });
    } else {
      this.setState({
        isInputValid: false,
      });
    }
  };

  requestUserInterests = userId => {

    fetch(`${interestGetUrl}${userId}`, { mode: 'cors' })
      .then(res => res.json())
      .then(data => {

        if (data.Count < 1) {
          data.Items = [
            {
              'coffeeCount': {
                'N': '0'
              },
              'matched': {
                'S': 'null'
              },
              'interests': {
                'L': [
                ]
              },
              'userId': {
                'S': userId
              }
            }
          ];
        }
        let userInfo = data.Items[0];

        let selectedInterests = [];
        for (let i = 0; i < userInfo.interests.L.length; i++) {
          selectedInterests.push(userInfo.interests.L[i]['S']);
        }
        let matched =
          userInfo.matched['S'] === 'null'
            ? 'null'
            : userInfo.matched['S'];

        let coffeeCount = 0;

        let filteredInterests = interests.filter(function (interest) {
          return selectedInterests.indexOf(interest) === -1;
        });
        let cookies = getCookies();
        if (matched !== 'null') {
          createCookie('isPendingMatch', false, 1);
        }

        this.setState({
          selectedInterests: selectedInterests,
          interests: filteredInterests,
          coffeeCount,
          matched,
          areInterestsSubmitted: false,
          isPendingMatch: cookies.isPendingMatch
        });
      })
      .catch(err => console.log(err)); // eslint-disable-line no-console
  };

  onClickSelectedInterestHandler = (selectedInterestIndex) => {
    let selectedInterests = this.state.selectedInterests;

    let newSelectedInterests = [
      ...selectedInterests.slice(0, selectedInterestIndex),
      ...selectedInterests.slice(
        selectedInterestIndex + 1,
        selectedInterests.length
      )
    ];

    let filteredInterests = interests.filter(function (interest) {
      return newSelectedInterests.indexOf(interest) === -1;
    });

    this.setState({
      selectedInterests: newSelectedInterests,
      interests: filteredInterests
    });
  };

  onAutoCompleteSelect = (selectedInterest) => {
    this.setState({
      isInputValid: true,
    });

    document.activeElement.blur();

    let selectedInterests = this.state.selectedInterests.indexOf(selectedInterest) > -1 ?
      this.state.selectedInterests : [...this.state.selectedInterests, selectedInterest];

    let interests = this.state.interests;

    let selectedInterestIndex = interests.indexOf(selectedInterest);

    this.setState({
      value: '',
      selectedInterests: selectedInterests,
      interests: [
        ...interests.slice(0, selectedInterestIndex),
        ...interests.slice(
          selectedInterestIndex + 1,
          interests.length
        )
      ],
    });
  };

  onAutoCompleteValueChange = (value) => {
    this.setState({ value });
  };

  onBackToProfileClick = () => {
    this.requestUserInterests(this.state.userId);
    // this.setState({
    //   areInterestsSubmitted: false,
    // });
  };

  logoutUser = () => {
    createCookie('latteUserId', this.state.userId, -1);
    createCookie('latteSession', 'https://zillow.okta.com', -1);
  };

  componentDidMount() {

    const redirectUrl = 'https://1000lattes.com';
    var orgUrl = 'https://zillow.okta.com';
    var oktaSignIn = new OktaSignIn({ baseUrl: orgUrl, logo: LattesLogo }); // eslint-disable-line no-undef

    let cookies = getCookies();

    if (cookies.latteSession) {
      this.setState({
        isLoggedIn: true,
        userId: cookies.latteUserId,
        firstName: cookies.firstName,
        isPendingMatch: cookies.isPendingMatch
      });
    } else {
      oktaSignIn.renderEl(
        { el: '#okta-login-container' },
        function (res) {
          if (res.status === 'SUCCESS') {
            createCookie('latteSession', 'https://zillow.okta.com', 1);

            const email = res.user.profile.login;
            const userId = email.substr(0, email.indexOf('@'));
            // const fullName = res.user.profile.firstName + " " + res.user.profile.lastName;
            createCookie('latteUserId', userId, 1);
            createCookie('firstName', res.user.profile.firstName, 1);
            createCookie('isPendingMatch', false, 1);
            // createCookie('lastName', res.user.profile.lastName, 1);
            res.session.setCookieAndRedirect(redirectUrl);
          } else {
            this.displayErrorPage();
          }
        }
      );
    }
    this.requestUserInterests(cookies.latteUserId);
  }

  displayErrorPage() {
    // todo: trigger actual error page
    alert('Sorry, something seems to have gone wrong. Please try refreshing or coming back later!');
  }

  render() {

    if (!this.state.isLoggedIn) {
      return (
        <div>
          <div className="backgroundImageLattes">
            <img className="fullWidthHeight" src={ LattesBackgroundImage } />
          </div>
          <div className="miniCol24 xxsCol24 mdColOffset8 mdCol8 pan">
            <div id="okta-login-container"></div>
          </div>
        </div>
      );
    }

    return (
      <div >
        <div className="backgroundImageLattes">
          <img className="imgResponsive fullWidthHeight" src={ LattesBackgroundImage } />
        </div>

        <div id="headerContainer" className=" miniCol24 xxsColOffset4 xxsCol16 smlColOffset5 smlCol14 mdColOffset7 mdCol10 pvm prm coffeeTrackerContainer fullWidth">
          <div className="miniCol5 xxsCol6 xsCol5 smlCol5 mdCol4 lrgCol4 txtC coffeeTrackerImage centerBlock">
            <img src={ LattesLogo }
              alt=""
              className="imgResponsive phm pts"
            />
          </div>
        </div>

        <div id="profileContainer" className="miniCol24 xxsColOffset4 xxsCol16 smlColOffset5 smlCol14 mdColOffset7 mdCol10 backgroundBasic  ptm fullWidth">

          {
            this.state.areInterestsSubmitted ?
              <RequestComplete
                matched={ this.state.matched }
                onBackToProfileClick={ this.onBackToProfileClick }
              />
              :
              <Profile
                userId={ this.state.userId }
                firstName={ this.state.firstName }
                interests={ this.state.interests }
                selectedInterests={ this.state.selectedInterests }
                value={ this.state.value }
                matched={ this.state.matched }
                onClickSelectedInterestHandler={ this.onClickSelectedInterestHandler }
                onAutoCompleteSelect={ this.onAutoCompleteSelect }
                onAutoCompleteValueChange={ this.onAutoCompleteValueChange }
                onSubmitInterests={ this.submitInterests }
                isInputValid={ this.state.isInputValid }
                isPendingMatch={ this.state.isPendingMatch }
              />
          }

        </div>
      </div>
    );
  }
}

export default Lattes;
