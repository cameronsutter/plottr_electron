import React from 'react'
import PropTypes from 'react-proptypes'
import ListGroup from 'reeact-bootstrap/ ListGroup'
import ListGroupItem from 'reeact-bootstrap/ ListGroupItem'
import Col from 'reeact-bootstrap/ Col'
import Row from 'reeact-bootstrap/ Row'
import Grid from 'reeact-bootstrap/ Grid'
import Button from 'reeact-bootstrap/Button'
import { t } from 'plottr_locales'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'

const FailedUploads = ({ nextStep, failedTemplates, failedProjects }) => {
  const ListProjects = () => {
    return failedProjects.map((name, idx) => {
      return (
        <ListGroupItem key={idx}>
          <span>{name}</span>
        </ListGroupItem>
      )
    })
  }

  const ListTemplates = () => {
    return failedTemplates.map((name, idx) => {
      return (
        <ListGroupItem key={idx}>
          <span>{name}</span>
        </ListGroupItem>
      )
    })
  }

  return (
    <>
      <StepHeader>
        <h2>{t('We ran into problems uploading some files')}</h2>
      </StepHeader>
      <StepBody>
        <Grid>
          <Row>
            <Col size={6} sm={6}>
              <h5 className="with-links">
                <span>{t('Projects')}</span>
              </h5>
            </Col>
            <Col size={6} sm={6}>
              <h5 className="with-links">
                <span>{t('Templates')}</span>
              </h5>
            </Col>
          </Row>
          <Row className="onboarding__scrolling-wrapper">
            <Col size={6} sm={6}>
              <ListGroup className="onboarding__scrolling-list">
                <ListProjects />
              </ListGroup>
            </Col>
            <Col size={6} sm={6}>
              <ListGroup className="onboarding__scrolling-list">
                <ListTemplates />
              </ListGroup>
            </Col>
          </Row>
        </Grid>
      </StepBody>
      <StepFooter>
        <OnboardingButtonBar>
          <Button onClick={nextStep}>{t('Continue')}</Button>
        </OnboardingButtonBar>
      </StepFooter>
    </>
  )
}

FailedUploads.propTypes = {
  nextStep: PropTypes.func.isRequired,
  failedProjects: PropTypes.array.isRequired,
  failedTemplates: PropTypes.array.isRequired,
}

export default FailedUploads
