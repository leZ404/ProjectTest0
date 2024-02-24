import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ToolbarSelectService } from '@app/services/toolbar-select.service';

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent implements OnInit {

  @Output() colorSelected = new EventEmitter<string>();
  constructor(
    readonly toolbarSelectService: ToolbarSelectService
  ) {}

  ngOnInit(): void {

  }

  penWidthChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.toolbarSelectService.pencilWidthSelected.next(inputElement.valueAsNumber);
  }

  eraserWidthChanged(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.toolbarSelectService.eraserWidthSelected.next(inputElement.valueAsNumber);
  }

}
