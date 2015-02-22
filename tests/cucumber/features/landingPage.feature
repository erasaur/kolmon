Feature: Attractive Landing Page

  As a visitor
  I want to be greeted with a nice landing page
  So that I am compelled to join the game

  Scenario: Visitors can see a welcome message
    Given I am a new visitor
    When I navigate to the landing page
    Then I see the heading "KOLMON"

  Scenario: Visitors can join by signing up
    Given I am a new visitor
    When I navigate to the landing page
    Then I see a button to sign up

