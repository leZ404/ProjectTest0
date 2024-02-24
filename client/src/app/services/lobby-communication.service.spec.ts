import { TestBed } from '@angular/core/testing';

import { LobbyCommunicationService } from './lobby-communication.service';

describe('LobbyCommunicationService', () => {
  let service: LobbyCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LobbyCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set player name when init is called', () => {
    service.init('test');
    expect(service.getPlayerName()).toBe('test');
  });
});
