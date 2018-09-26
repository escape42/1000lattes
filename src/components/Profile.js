import React from 'react';

import Autocomplete from 'react-autocomplete';
import SelectedInterests from './SelectedInterests';

import {
  matchStateToTerm,
  upperCaseFirstLetter,
} from '../latteHelper';


class Profile extends React.Component {

  constructor(props) {
    super(props);

  }

  onInputKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      return false;
    }

  }

  onWelcomeContainerTouchStart() {
    document.getElementById('interestsAutocomplete').blur();
  }

  render() {

    const styles = {
      item: {
        padding: '2px 6px',
        cursor: 'default'
      },
      highlightedItem: {
        color: 'white',
        background: 'hsl(200, 50%, 50%)',
        padding: '2px 6px',
        cursor: 'default'
      },
      menu: {
        borderradius: '3px',
        border: '1px solid papayawhip',
        boxshadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 1.0)',
        padding: '2px 0',
        fontSize: '90%',
        position: 'absolute',
        top: '37px', // height of #intrestsAutocomplete input
        left: '0',
        overflow: 'scroll',
        WebkitOverflowScrolling: 'touch',
        minHeight: '200px',
        maxHeight: '30%', // TODO: don't cheat, let it flow to the bottom
        zIndex: '1000'
      }
    };

    const skylightUri = 'https://skylight.zillowgroup.com/zallwall?seed=';

    return (
      <div>
        <div id="welcomeContainer" className="row phl" onTouchStart={ this.onWelcomeContainerTouchStart }>
          {
            (this.props.matched !== 'null') &&
            <p className="typeGoodIndicator typeEmphasize">
              This week you've been matched with:
                <a href={ skylightUri.concat(this.props.matched) } target="blank" className="linkForward">{' ' + this.props.matched.concat('@zillowgroup.com')}</a>
            </p>
          }
          {
            (this.props.matched === 'null' && this.props.isPendingMatch) &&
            <p className="typeLowlight">
              We'll notify you once we find you a coffee buddy!
            </p>
          }
          <h2 className="ptm typeEmphasize">
            Hi {upperCaseFirstLetter(this.props.firstName)},
          </h2>

        </div>

        <div id="interestContainer" className="row phl" >
          <p className="pvm" onTouchStart={ this.onWelcomeContainerTouchStart }>
            Tell us a little about yourself and we will match you with a coffee buddy.
          </p>
          <h6>Interests <span className="plm maxInterestHelperText typeLowlight">10 max, e.g. 'Cooking', or 'Travel' </span></h6>
          <form className="form">
            <div className="field" >
              <span className="fieldItem text">

                <Autocomplete
                  inputProps={ { id: 'interestsAutocomplete', placeholder: 'Add an interest', onKeyDown: this.onInputKeyDown.bind(this) } }
                  menuStyle={ styles.menu }
                  value={ this.props.value }
                  wrapperProps={ { className: 'miniCol24 xxsCol20 xsCol18 smlCol20 mdCol18 lrgCol16 pan prm' } }
                  items={ this.props.interests }
                  getItemValue={ item => item }
                  shouldItemRender={ matchStateToTerm }
                  onSelect={ (value) => this.props.onAutoCompleteSelect(value) }
                  onChange={ (event, value) => this.props.onAutoCompleteValueChange(value) }
                  renderItem={ (item, isHighlighted) =>
                    <div
                      style={
                        isHighlighted ? styles.highlightedItem : styles.item
                      }
                      key={ item }
                    >
                      {item}
                    </div> }
                />

                <div className="miniCol24 xxsCol20 xsCol18 smlCol20 mdCol18 lrgCol16 pln">
                  <SelectedInterests
                    selectedInterests={ this.props.selectedInterests }
                    onClickSelectedInterestHandler={ this.props.onClickSelectedInterestHandler }
                  />
                </div>
              </span>
            </div>
            {
              !this.props.isInputValid && <div className="typePoorIndicator">Please select at least 1 interest</div>
            }
          </form>
        </div>

        <div className="row pvm phl">
          <div className="miniCol24 xxsCol10 pln">
            <button
              className="pam btn btnSecondary findButton typeEmphasize"
              onClick={ () => this.props.onSubmitInterests() }
            >
              {this.props.matched === 'null' && this.props.isPendingMatch === 'false' ? 'Find a coffee buddy' : 'Re-Match'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;
